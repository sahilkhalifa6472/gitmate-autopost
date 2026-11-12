// Comment-to-DM auto reply (like ManyChat), done by polling on every 5-minute cron run.
// 1) someone comments the keyword (e.g. "GITMATE") on a recent post
//    -> private reply DM with that post's link, plus a short public reply under the comment
// 2) someone sends the keyword in a DM -> reply with the latest links (only inside Instagram's 24h window)
import * as ig from "./ig";
import { get, set, setAdd, setHas, pushList, getList, lock, unlock } from "./store";
import { getConfig, getQueue, log } from "./data";
import { ArEvent, AutoReplyConfig, DEFAULT_AR, Item } from "./types";

export async function getAr(): Promise<AutoReplyConfig> {
  const saved = await get<Partial<AutoReplyConfig>>("ar_config", {});
  return { ...DEFAULT_AR, ...saved, links: { ...(saved.links || {}) } };
}
export async function saveAr(c: AutoReplyConfig) { await set("ar_config", c); }
export async function arEvents(n = 150): Promise<ArEvent[]> { return getList("ar_events", n); }
const event = (e: Omit<ArEvent, "at">) => pushList("ar_events", { at: new Date().toISOString(), ...e }, 600);

const fill = (t: string, v: Record<string, string>) => t.replace(/\{(\w+)\}/g, (m, k) => (k in v ? v[k] : m));
const pick = <T,>(a: T[], seed: string) => a[[...seed].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7) % a.length];

// A whole-system problem (missing permission, bad token, rate limit): stop the run, don't mark anything as done
function isFatal(msg: string) {
  const code = Number(/"code":\s*(\d+)/.exec(msg)?.[1] || 0);
  if ([190, 4, 17, 32, 613].includes(code)) return true;            // token / rate limits
  if ((code === 10 || code === 200 || code === 3) && /permission|capabilit/i.test(msg) && !/window|outside/i.test(msg)) return true;
  return /^(401|403) /.test(msg) && !/window|outside/i.test(msg);
}

// link for a post: manual override > queue item link > default
export function linkFor(ar: AutoReplyConfig, q: Item[], mediaId: string) {
  const it = q.find((i) => i.media_id === mediaId);
  return { link: ar.links[mediaId] || it?.link || ar.default_link || "", title: it?.title || "" };
}

export async function runAutoReply(opts: { force?: boolean } = {}) {
  const ar = await getAr();
  if (!ar.enabled && !ar.dm_enabled && !opts.force) return { ok: true, note: "auto-reply off" };
  if (!(await lock("ar", 120))) return { ok: false, note: "auto-reply busy" };
  const t0 = Date.now();
  let sent = 0, seen = 0;
  try {
    const cfg = await getConfig();
    if (!cfg.ig_token || !cfg.ig_user_id) return { ok: false, note: "not connected" };
    const q = await getQueue();
    const kw = ar.keyword.trim().toLowerCase();
    if (!kw) return { ok: false, note: "no keyword" };
    const sinceMs = Date.now() - Math.min(7, ar.days) * 864e5;
    const budget = Math.max(1, Math.min(50, ar.max_per_run));
    const timeLeft = () => Date.now() - t0 < 40e3;

    if (ar.enabled) {
      const media = (await ig.listMedia(cfg.ig_user_id, cfg.ig_token, 25)).filter((m) => Date.parse(m.timestamp) >= sinceMs - 7 * 864e5 && (m.comments_count ?? 1) > 0);
      outer: for (const m of media) {
        if (!timeLeft() || sent >= budget) break;
        const { link, title } = linkFor(ar, q, m.id);
        const comments = await ig.listComments(m.id, cfg.ig_token, sinceMs);
        // oldest first, so the backlog is answered in order
        for (const c of comments.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))) {
          if (Date.parse(c.timestamp) < sinceMs) continue;
          const user = c.from?.username || c.username || "";
          if (!c.text?.toLowerCase().includes(kw) || user === cfg.username) continue;
          if (await setHas("ar_done", c.id)) continue;
          seen++;
          if (!link) { // nothing to send yet: leave it unanswered so it goes out once a link is set
            continue;
          }
          if (sent >= budget || !timeLeft()) break outer;
          try {
            await ig.privateReply(cfg.ig_user_id, cfg.ig_token, c.id, fill(ar.dm_text, { username: user ? "@" + user : "there", link, title }));
          } catch (e: any) {
            if (isFatal(e.message)) throw e;
            await setAdd("ar_done", c.id);
            seen--;
            await event({ kind: "comment", username: user, text: c.text.slice(0, 200), media_id: m.id, status: "failed", note: e.message.slice(0, 200) });
            continue;
          }
          await setAdd("ar_done", c.id);
          sent++;
          let note = "";
          if (ar.public_replies.length) {
            try { await ig.replyToComment(c.id, cfg.ig_token, pick(ar.public_replies, c.id)); }
            catch (e: any) { note = `DM sent, public reply failed: ${e.message.slice(0, 120)}`; }
          }
          await event({ kind: "comment", username: user, text: c.text.slice(0, 200), media_id: m.id, status: "sent", note });
        }
      }
      const noLink = media.filter((m) => !linkFor(ar, q, m.id).link).length;
      if (seen > sent && noLink && (await lock("ar_warn", 3 * 3600))) await log("warn", `Auto-reply: ${noLink} recent post(s) have no link set, their "${ar.keyword}" comments wait (Inbox page → Post links)`);
    }

    if (ar.dm_enabled && timeLeft() && sent < budget) {
      const posted = q.filter((i) => i.status === "posted" && i.link).sort((a, b) => Date.parse(b.posted_at || "") - Date.parse(a.posted_at || "")).slice(0, 3);
      const links = posted.map((i) => `• ${i.title.split(":")[0]}: ${i.link}`).join("\n") || ar.default_link;
      for (const cv of await ig.conversations(cfg.ig_user_id, cfg.ig_token, 25)) {
        if (sent >= budget || !timeLeft()) break;
        if (Date.now() - Date.parse(cv.updated_time) > 23 * 3600e3) continue; // outside the 24h reply window
        const last = cv.messages?.data?.[0];
        if (!last?.message || !last.from || last.from.username === cfg.username) continue;
        if (!last.message.toLowerCase().includes(kw) || !links) continue;
        if (await setHas("ar_dm_done", last.id)) continue;
        await setAdd("ar_dm_done", last.id);
        const user = last.from.username || "";
        try {
          await ig.sendDM(cfg.ig_user_id, cfg.ig_token, last.from.id, fill(ar.dm_inbox_text, { username: user ? "@" + user : "there", links }));
          sent++;
          await event({ kind: "dm", username: user, text: last.message.slice(0, 200), status: "sent" });
        } catch (e: any) {
          if (isFatal(e.message)) throw e;
          await event({ kind: "dm", username: user, text: last.message.slice(0, 200), status: "failed", note: e.message.slice(0, 200) });
        }
      }
    }

    const fresh = await getAr();
    fresh.last_run_at = new Date().toISOString();
    fresh.last_error = undefined;
    fresh.sent_total = (fresh.sent_total || 0) + sent;
    await saveAr(fresh);
    if (sent) await log("ok", `Auto-reply: sent ${sent} DM(s)${seen > sent ? `, ${seen - sent} more waiting for the next run` : ""}`);
    return { ok: true, sent, waiting: Math.max(0, seen - sent) };
  } catch (e: any) {
    const fresh = await getAr();
    fresh.last_run_at = new Date().toISOString();
    fresh.last_error = e.message.slice(0, 400);
    await saveAr(fresh);
    await log("error", `Auto-reply stopped: ${e.message}`);
    return { ok: false, error: e.message, sent };
  } finally {
    await unlock("ar");
  }
}

