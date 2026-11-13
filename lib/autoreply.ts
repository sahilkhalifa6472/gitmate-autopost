// Comment-to-DM auto reply (like ManyChat), done by polling on every 5-minute cron run.
// 1) someone comments the keyword (e.g. "GITMATE") on a recent post
//    -> private reply DM with that post's link, plus a short public reply under the comment
// 2) someone sends the keyword in a DM -> reply with the latest links (only inside Instagram's 24h window)
import * as ig from "./ig";
import { handleOrderDM } from "./orders";
import { get, set, setAdd, setHas, setRemove, pushList, getList, lock, unlock } from "./store";
import { getConfig, getQueue, log } from "./data";
import { ArEvent, AutoReplyConfig, DEFAULT_AR, Item } from "./types";

export async function getAr(): Promise<AutoReplyConfig> {
  const saved = await get<Partial<AutoReplyConfig>>("ar_config", {});
  return { ...DEFAULT_AR, ...saved, links: { ...(saved.links || {}) } };
}
export async function saveAr(c: AutoReplyConfig) { await set("ar_config", c); }
export async function arEvents(n = 150): Promise<ArEvent[]> { return getList("ar_events", n); }
const event = (e: Omit<ArEvent, "at">) => pushList("ar_events", { at: new Date().toISOString(), ...e }, 600);

const DEFAULT_GATE = "Hey {username}! 👋 Here's {title} from our reel 🔥\n\nJust reply \"LINK\" here and I'll send it to you in a sec ✨";
const DEFAULT_FOLLOW = "Almost there {username}! 🙌\n\nThe link is for followers only. Follow {account} (1 useful repo every day), then reply \"DONE\" here 👇";
// "git mate", "Git-Mate", "GITMATE" all count
const hasKw = (t: string | undefined, kw: string) => !!t && t.toLowerCase().replace(/[\s._-]+/g, "").includes(kw.replace(/[\s._-]+/g, ""));
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

type Pending = { link: string; title: string; thumb?: string; user: string; at: number };
type Ctx = { cfg: Awaited<ReturnType<typeof getConfig>> & { ig_user_id: string }; ar: AutoReplyConfig; tok: string; q: Item[]; pending: Record<string, Pending> };
const GATE_RE = /link|follow|done|yes|send|ok/i;

// Follow gate step 2: they tapped "Send me the link" / "I followed" (or typed LINK / DONE) -> check follow, then send the link card
async function handleGateDM(ctx: Ctx, m: { mid: string; fromId: string; username?: string; text: string; payload: string }): Promise<boolean> {
  const { cfg, ar, tok, pending } = ctx;
  const pend = pending[m.fromId];
  if (!pend) return false;
  if (await setHas("ar_dm_done", m.mid)) return false;
  await setAdd("ar_dm_done", m.mid);
  const user = m.username || pend.user;
  const said = (m.text || m.payload).slice(0, 200);
  try {
    if (await ig.followsUs(m.fromId, tok)) {
      await ig.sendCard(cfg.ig_user_id, tok, m.fromId, {
        title: `${(pend.title.split(":")[0] || "Your repo").trim()} 🔥`,
        subtitle: "Here's the repo from our reel. Thanks for following! 🙌",
        image_url: pend.thumb,
        buttons: [{ title: "Open on GitHub", url: pend.link }, { title: "More repos 🔥", url: `https://www.instagram.com/${cfg.username || "git.mate"}/` }],
      });
      const fresh = await get<Record<string, Pending>>("ar_pending", {});
      delete fresh[m.fromId]; delete pending[m.fromId]; await set("ar_pending", fresh);
      await event({ kind: "dm", username: user, text: said, status: "sent", note: "follower, link card sent" });
      return true;
    }
    await ig.sendQR(cfg.ig_user_id, tok, m.fromId, fill(ar.follow_text || DEFAULT_FOLLOW, { username: user ? "@" + user : "there", account: "@" + (cfg.username || "git.mate") }), [{ title: "I followed ✅", payload: "GM_FOLLOWED" }]);
    await event({ kind: "dm", username: user, text: said, status: "skipped", note: "not following yet, asked to follow" });
    return false;
  } catch (e: any) {
    if (isFatal(e.message)) { await setRemove("ar_dm_done", m.mid); throw e; }
    await event({ kind: "dm", username: user, text: said, status: "failed", note: e.message.slice(0, 300) });
    return false;
  }
}

// One "gitmate" comment: gate DM (or link card), then a public reply. true = sent, false = failed (marked done)
async function handleComment(ctx: Ctx, c: ig.IgComment, m: { id: string; thumbnail_url?: string }, link: string, title: string): Promise<boolean> {
  const { cfg, ar, tok, pending } = ctx;
  const gate = ar.enabled && ar.follow_gate !== false;
  const user = c.from?.username || c.username || "";
  let how = "text";
  try {
    let gated = false;
    if (gate && c.from?.id) {
      try {
        await ig.privateReplyQR(cfg.ig_user_id, tok, c.id, fill(ar.gate_text || DEFAULT_GATE, { username: user ? "@" + user : "there", title: title.split(":")[0] || "the repo" }), [{ title: "Send me the link 🔗", payload: "GM_LINK" }]);
        gated = true; how = "gate";
        const p: Pending = { link, title, thumb: m.thumbnail_url, user, at: Date.now() };
        pending[c.from.id] = p;
        const fresh = await get<Record<string, Pending>>("ar_pending", {});
        fresh[c.from.id] = p; await set("ar_pending", fresh);
      } catch (e: any) {
        if (isFatal(e.message)) throw e; // otherwise fall back to sending the link card straight away
      }
    }
    if (!gated) try {
      if (await get<boolean>("ar_card_mode", false)) throw new Error("2534122 card mode");
      await ig.privateReply(cfg.ig_user_id, tok, c.id, fill(ar.dm_text, { username: user ? "@" + user : "there", link, title }));
    } catch (e: any) {
      if (!/2534122|Link can.t be shared/i.test(e.message)) throw e;
      // Instagram refused the raw link: send it as a button card instead
      how = "card";
      await set("ar_card_mode", true);
      await ig.privateReplyCard(cfg.ig_user_id, tok, c.id, {
        title: `Hey ${user ? "@" + user : "there"}! Here's your link 🔗`,
        subtitle: (title.split(":")[0] || "From @git.mate") + " · follow @git.mate for 1 repo a day",
        url: link, button: "Open on GitHub",
      });
    }
  } catch (e: any) {
    // Instagram refused the link itself: stop and keep the comment unanswered (sending to others would fail the same way)
    if (isFatal(e.message) || /2534122|Link can.t be shared/i.test(e.message)) throw e;
    await setAdd("ar_done", c.id);
    await event({ kind: "comment", username: user, text: c.text.slice(0, 200), media_id: m.id, status: "failed", note: e.message.slice(0, 600) });
    return false;
  }
  await setAdd("ar_done", c.id);
  let note = "";
  if (ar.public_replies.length) {
    try { await ig.replyToComment(c.id, tok, pick(ar.public_replies, c.id)); }
    catch (e: any) { note = `DM sent, public reply failed: ${e.message.slice(0, 120)}`; }
  }
  await event({ kind: "comment", username: user, text: c.text.slice(0, 200), media_id: m.id, status: "sent", note: [how === "card" ? "sent as link card" : how === "gate" ? "asked to tap for the link" : "", note].filter(Boolean).join(" · ") });
  return true;
}

// Instagram webhook (comments + messages): answers instantly, no polling
export async function handleWebhook(body: any) {
  const ar = await getAr();
  if (!ar.webhook_at || Date.now() - Date.parse(ar.webhook_at) > 10 * 60e3) { const f = await getAr(); f.webhook_at = new Date().toISOString(); await saveAr(f); }
  if (!ar.enabled) return { ok: true, note: "auto-reply off" };
  const cfg = await getConfig();
  const tok = ig.replyTokenFor(cfg);
  if (!tok || !cfg.ig_user_id) return { ok: false, note: "not connected" };
  const kw = ar.keyword.trim().toLowerCase();
  const pending = await get<Record<string, Pending>>("ar_pending", {});
  const ctx: Ctx = { cfg: cfg as Ctx["cfg"], ar, tok, q: await getQueue(), pending };
  let sent = 0;
  try {
    for (const entry of body?.entry || []) {
      for (const ch of entry.changes || []) {
        if (ch.field !== "comments" || !ch.value?.id || !ch.value?.media?.id) continue;
        const v = ch.value;
        const c: ig.IgComment = { id: String(v.id), text: String(v.text || ""), timestamp: new Date().toISOString(), from: v.from, username: v.from?.username };
        if (!kw || !hasKw(c.text, kw) || c.username === cfg.username) continue;
        const { link, title } = linkFor(ar, ctx.q, String(v.media.id));
        if (!link) continue; // the cron answers it once a link is set
        if (!(await lock("arc:" + c.id, 300))) continue;
        if (await setHas("ar_done", c.id)) continue;
        const thumb = await ig.mediaThumb(String(v.media.id), tok);
        if (await handleComment(ctx, c, { id: String(v.media.id), thumbnail_url: thumb }, link, title)) sent++;
      }
      for (const ev of entry.messaging || []) {
        const msg = ev.message, pb = ev.postback;
        if (msg?.is_echo || !ev.sender?.id || ev.sender.id === cfg.ig_user_id) continue;
        const text = String(msg?.text || pb?.title || "");
        const payload = String(msg?.quick_reply?.payload || pb?.payload || "");
        const images = (msg?.attachments || []).filter((a: any) => a?.type === "image" && a?.payload?.url).map((a: any) => String(a.payload.url));
        if ((!payload || payload.startsWith("GM_PAY_")) && (msg?.mid || pb?.mid)) {
          try { if (await handleOrderDM({ igsid: String(ev.sender.id), mid: String(msg?.mid || pb?.mid), text, images, payload })) continue; }
          catch (e: any) { await log("error", `Orders: ${e.message}`); }
        }
        if (!pending[ev.sender.id] || !(/^GM_/.test(payload) || GATE_RE.test(text))) continue;
        const mid = String(msg?.mid || pb?.mid || `${ev.sender.id}:${ev.timestamp}`);
        if (await handleGateDM(ctx, { mid, fromId: String(ev.sender.id), text, payload })) sent++;
      }
    }
    return { ok: true, sent };
  } catch (e: any) {
    const f = await getAr(); f.last_error = "webhook: " + e.message.slice(0, 380); await saveAr(f);
    await log("error", `Auto-reply webhook: ${e.message}`);
    return { ok: false, error: e.message, sent };
  }
}

export async function runAutoReply(opts: { force?: boolean } = {}) {
  const ar = await getAr();
  if (!ar.enabled && !ar.dm_enabled && !opts.force) return { ok: true, note: "auto-reply off" };
  if (!(await lock("ar", 120))) return { ok: false, note: "auto-reply busy" };
  const t0 = Date.now();
  let sent = 0, seen = 0;
  try {
    const cfg = await getConfig();
    const tok = ig.replyTokenFor(cfg);
    if (!tok || !cfg.ig_user_id) return { ok: false, note: "not connected" };
    const q = await getQueue();
    const kw = ar.keyword.trim().toLowerCase();
    if (!kw) return { ok: false, note: "no keyword" };
    const sinceMs = Date.now() - Math.min(7, ar.days) * 864e5;
    const budget = Math.max(1, Math.min(50, ar.max_per_run));
    const timeLeft = () => Date.now() - t0 < 40e3;

    const pending = await get<Record<string, Pending>>("ar_pending", {});
    for (const [k, v] of Object.entries(pending)) if (Date.now() - v.at > 7 * 864e5) delete pending[k];
    const gate = ar.enabled && ar.follow_gate !== false;

    const ctx: Ctx = { cfg: cfg as Ctx["cfg"], ar, tok, q, pending };
    // with webhooks working, DMs arrive instantly: the cron only scans as a slow safety net (saves Meta's hourly app limit)
    const hooked = !opts.force && Date.now() - Date.parse(ar.webhook_at || "") < 6 * 3600e3;
    if (!hooked || (await lock("ar_scan", 25 * 60))) {
    // Step 2 of the follow gate: they tapped "Send me the link" / "I followed" -> check follow, then send the link card
    if (gate && Object.keys(pending).length) {
      for (const cv of await ig.conversations(cfg.ig_user_id, tok, 25)) {
        if (sent >= budget || !timeLeft()) break;
        if (Date.now() - Date.parse(cv.updated_time) > 23 * 3600e3) continue;
        const last = cv.messages?.data?.[0];
        if (!last?.from || last.from.username === cfg.username) continue;
        const pend = pending[last.from.id];
        if (!pend || !GATE_RE.test(last.message || "")) continue;
        if (await handleGateDM(ctx, { mid: last.id, fromId: last.from.id, username: last.from.username, text: last.message || "", payload: "" })) sent++;
      }
    }

    const counts = await get<Record<string, number>>("ar_ccount", {});
    if (ar.enabled) {
      const media = (await ig.listMedia(cfg.ig_user_id, tok, 25)).filter((m) => Date.parse(m.timestamp) >= sinceMs - 7 * 864e5 && (m.comments_count ?? 1) > 0);
      outer: for (const m of media) {
        if (!timeLeft() || sent >= budget) break;
        const { link, title } = linkFor(ar, q, m.id);
        // save API calls (Meta's hourly app limit): skip posts whose comment count didn't change since they were fully handled
        if (link && m.comments_count != null && counts[m.id] === m.comments_count) continue;
        let leftover = false;
        const comments = await ig.listComments(m.id, tok, sinceMs);
        // oldest first, so the backlog is answered in order
        for (const c of comments.sort((a, b) => Date.parse(a.timestamp) - Date.parse(b.timestamp))) {
          if (Date.parse(c.timestamp) < sinceMs) continue;
          const user = c.from?.username || c.username || "";
          if (!hasKw(c.text, kw) || user === cfg.username) continue;
          if (await setHas("ar_done", c.id)) continue;
          seen++;
          if (!link) { // nothing to send yet: leave it unanswered so it goes out once a link is set
            leftover = true;
            continue;
          }
          if (sent >= budget || !timeLeft()) { leftover = true; break outer; }
          if (await handleComment(ctx, c, m, link, title)) sent++; else seen--;
        }
        if (!leftover && m.comments_count != null) { counts[m.id] = m.comments_count; await set("ar_ccount", counts); }
      }
      const noLink = media.filter((m) => !linkFor(ar, q, m.id).link).length;
      if (seen > sent && noLink && (await lock("ar_warn", 3 * 3600))) await log("warn", `Auto-reply: ${noLink} recent post(s) have no link set, their "${ar.keyword}" comments wait (Inbox page → Post links)`);
    }
    }

    if (ar.dm_enabled && timeLeft() && sent < budget) {
      const posted = q.filter((i) => i.status === "posted" && i.link).sort((a, b) => Date.parse(b.posted_at || "") - Date.parse(a.posted_at || "")).slice(0, 3);
      const links = posted.map((i) => `• ${i.title.split(":")[0]}: ${i.link}`).join("\n") || ar.default_link;
      for (const cv of await ig.conversations(cfg.ig_user_id, tok, 25)) {
        if (sent >= budget || !timeLeft()) break;
        if (Date.now() - Date.parse(cv.updated_time) > 23 * 3600e3) continue; // outside the 24h reply window
        const last = cv.messages?.data?.[0];
        if (!last?.message || !last.from || last.from.username === cfg.username) continue;
        if (!hasKw(last.message, kw) || !links) continue;
        if (await setHas("ar_dm_done", last.id)) continue;
        await setAdd("ar_dm_done", last.id);
        const user = last.from.username || "";
        try {
          await ig.sendDM(cfg.ig_user_id, tok, last.from.id, fill(ar.dm_inbox_text, { username: user ? "@" + user : "there", links }));
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

