// The worker: webhooks (instant) + a 5-minute cron (posting, token refresh, and a safety re-check of comments/DMs).
import * as ig from "./ig";
import { aiReady, aiReply, Turn } from "./ai";
import { Account, Rule, accountList, account, patchAccount, posts, savePosts, log, addHandoff } from "./data";
import { claim, unclaim, bump, get, set, lock, unlock } from "./store";

const norm = (t: string) => t.toLowerCase().replace(/[\s._-]+/g, "");
const matches = (text: string | undefined, r: Rule) => !!text && r.on && !!r.keyword.trim() && norm(text).includes(norm(r.keyword));
const STOP = /^\s*(stop|unsubscribe|band karo|mat bhejo|don'?t message)\b/i;
const dmToken = (a: Account) => a.reply_token || a.token;
// whole-account problems (bad token, rate limit, missing permission): don't mark the item as done
const fatal = (msg: string) => /"code":\s*(190|4|17|32|613)\b/.test(msg) || (/^(401|403) /.test(msg) && !/window|outside/i.test(msg));

// ---------- comment -> DM
export async function handleComment(acc: Account, c: { id: string; text: string; from?: { id: string; username?: string }; timestamp?: string }) {
  if (!c.from?.id || c.from.id === acc.id) return;
  const at = c.timestamp ? Date.parse(c.timestamp) : Date.now();
  const rule = acc.rules.find((r) => matches(c.text, r) && at >= (r.created || 0) - 60_000);
  if (!rule) return;
  if (!(await claim(`done_c:${acc.id}`, c.id))) return;
  const who = c.from.username ? "@" + c.from.username : "someone";
  const tok = dmToken(acc);
  try {
    if (rule.link) await ig.privateReplyCard(acc.id, tok, c.id, { title: rule.dm_text, url: rule.link, button: rule.button || "Open link" });
    else await ig.privateReply(acc.id, tok, c.id, rule.dm_text);
    if (rule.public_reply) await ig.replyToComment(c.id, tok, rule.public_reply).catch(() => {});
    await log(acc.id, "comment", `${who} commented "${c.text.slice(0, 60)}" -> DM sent (${rule.keyword})`);
  } catch (e: any) {
    if (fatal(e.message)) await unclaim(`done_c:${acc.id}`, c.id);
    await log(acc.id, "comment", `${who}: DM failed: ${e.message}`, false);
  }
}

// ---------- incoming DM -> keyword reply or AI reply
export async function pausedUsers(accId: string) { return get<Record<string, number>>(`paused:${accId}`, {}); }
export async function setPaused(accId: string, userId: string, on: boolean) {
  const p = await pausedUsers(accId);
  if (on) p[userId] = Date.now(); else delete p[userId];
  await set(`paused:${accId}`, p);
}

export async function handleDM(acc: Account, m: { mid: string; from: string; text?: string }) {
  if (!m.from || m.from === acc.id || !m.text) return;
  if (!(await claim(`done_m:${acc.id}`, m.mid))) return;
  const tok = dmToken(acc);
  try {
    if (STOP.test(m.text)) {
      await setPaused(acc.id, m.from, true);
      await addHandoff({ account: acc.id, user_id: m.from, text: m.text, why: "Said stop: AI paused for this person" });
      return;
    }
    const rule = acc.rules.find((r) => norm(m.text!) === norm(r.keyword) && r.on);
    if (rule) {
      await ig.sendDM(acc.id, tok, m.from, rule.link ? `${rule.dm_text}\n${rule.link}` : rule.dm_text);
      await log(acc.id, "dm", `keyword "${rule.keyword}" in DM -> reply sent`);
      return;
    }
    if (!acc.ai_on || !aiReady()) return;
    if ((await pausedUsers(acc.id))[m.from]) return;
    if ((await bump(`ai_rate:${acc.id}`, 3600)) > 60) { await log(acc.id, "ai", "AI hourly limit (60) reached, skipped", false); return; }
    const hist = await ig.convoWith(acc.id, tok, m.from, 12).catch(() => [] as ig.IgMsg[]);
    const turns: Turn[] = hist.reverse().filter((x) => x.message).map((x) => ({ from: x.from?.id === acc.id ? "us" : "customer", text: x.message! }));
    if (!turns.length || turns[turns.length - 1].text !== m.text) turns.push({ from: "customer", text: m.text });
    const out = await aiReply(acc, turns);
    if (out.reply) await ig.sendDM(acc.id, tok, m.from, out.reply);
    if (out.handoff) {
      await setPaused(acc.id, m.from, true);
      const username = await ig.userName(m.from, tok);
      await addHandoff({ account: acc.id, user_id: m.from, username, text: m.text, why: out.reason || "AI needs you" });
    }
    await log(acc.id, "ai", `"${m.text.slice(0, 50)}" -> ${out.reply ? `"${out.reply.slice(0, 80)}"` : "(no reply)"}${out.handoff ? " [needs you]" : ""}`);
  } catch (e: any) {
    if (fatal(e.message)) await unclaim(`done_m:${acc.id}`, m.mid);
    await log(acc.id, "dm", `DM handling failed: ${e.message}`, false);
  }
}

// ---------- webhook body from Meta
export async function handleWebhook(body: any) {
  for (const entry of body?.entry || []) {
    const acc = await account(String(entry.id));
    if (!acc) continue;
    for (const ev of entry.messaging || []) {
      const msg = ev.message;
      if (!msg || msg.is_echo || msg.is_deleted) continue;
      await handleDM(acc, { mid: msg.mid, from: String(ev.sender?.id || ""), text: msg.text || msg.quick_reply?.payload });
    }
    for (const ch of entry.changes || []) {
      if (ch.field !== "comments") continue;
      const v = ch.value || {};
      await handleComment(acc, { id: String(v.id), text: v.text || "", from: v.from, timestamp: undefined });
    }
  }
}

// ---------- cron tick
async function postingTick() {
  const list = await posts();
  let changed = false;
  for (const p of list) {
    if (p.status !== "scheduled" && p.status !== "processing") continue;
    if (p.status === "scheduled" && p.at > Date.now()) continue;
    const acc = await account(p.account);
    if (!acc) { p.status = "failed"; p.error = "account removed"; changed = true; continue; }
    try {
      if (p.status === "scheduled") {
        const c = await ig.createReel(acc.id, acc.token, { video_url: p.video_url, caption: p.caption });
        p.creation_id = c.id; p.status = "processing"; p.tries = 0; changed = true;
        continue; // Instagram needs a minute or two to process the video
      }
      const st = await ig.containerStatus(p.creation_id!, acc.token);
      p.tries = (p.tries || 0) + 1; changed = true;
      if (st.status_code === "FINISHED") {
        const pub = await ig.publish(acc.id, acc.token, p.creation_id!);
        p.media_id = pub.id; p.status = "posted"; p.permalink = await ig.permalink(pub.id, acc.token);
        await log(acc.id, "post", `Posted: ${p.caption.slice(0, 60)}`);
      } else if (st.status_code === "ERROR" || st.status_code === "EXPIRED" || p.tries > 30) {
        p.status = "failed"; p.error = st.status || st.status_code;
        await log(acc.id, "post", `Post failed: ${p.error}`, false);
      }
    } catch (e: any) {
      p.status = "failed"; p.error = e.message.slice(0, 300); changed = true;
      await log(p.account, "post", `Post failed: ${p.error}`, false);
    }
  }
  if (changed) await savePosts(list);
}

async function accountTick(acc: Account) {
  // long-lived tokens last 60 days: refresh after 45
  if (!acc.token.startsWith("EAA") && Date.now() - acc.token_at > 45 * 864e5) {
    try { await patchAccount(acc.id, { token: await ig.refreshToken(acc.token), token_at: Date.now(), last_error: "" }); await log(acc.id, "token", "Token refreshed"); }
    catch (e: any) { await patchAccount(acc.id, { last_error: "Token refresh failed, please reconnect" }); await log(acc.id, "token", e.message, false); }
  }
  const tok = dmToken(acc);
  // safety net for missed comment webhooks: recent posts, comments of the last 3 days
  if (acc.rules.some((r) => r.on)) {
    const media = await ig.listMedia(acc.id, tok, 6).catch(() => []);
    for (const m of media.filter((x) => (x.comments_count || 0) > 0)) {
      const cs = await ig.listComments(m.id, tok).catch(() => []);
      for (const c of cs.filter((x) => Date.now() - Date.parse(x.timestamp) < 3 * 864e5)) await handleComment(acc, c);
    }
  }
  // safety net for missed DM webhooks: last message from them in the last 2 hours
  if (acc.ai_on || acc.rules.some((r) => r.on)) {
    const convos = await ig.conversations(acc.id, tok, 10).catch(() => []);
    for (const cv of convos) {
      const last = cv.messages?.data?.[0];
      if (!last?.from?.id || last.from.id === acc.id || Date.now() - Date.parse(last.created_time) > 2 * 3600e3) continue;
      await handleDM(acc, { mid: last.id, from: last.from.id, text: last.message });
    }
  }
}

export async function tick() {
  if (!(await lock("tick", 240))) return { skipped: "another run is busy" };
  try {
    await postingTick();
    for (const acc of await accountList()) await accountTick(acc).catch((e) => log(acc.id, "error", e.message, false));
    await set("last_tick", Date.now());
    return { ok: true };
  } finally { await unlock("tick"); }
}
