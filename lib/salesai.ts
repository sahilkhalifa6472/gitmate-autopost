// AI salesman for Instagram DMs: answers questions from people interested in a paid git.mate feature,
// using the whole DM thread + their order status, and nudges quiet leads once inside Instagram's 24h window.
// Runs on Google Gemini (cheap). Off until the owner pastes a Gemini key on the Orders page (or sets GEMINI_API_KEY in Vercel) and presses "Turn AI on" on the Orders page.
import * as ig from "./ig";
import { get, set, lock, pushList, getList } from "./store";
import { getConfig, log } from "./data";
import { getOrders, getOrderCfg, OrderCfg, Order } from "./orders";

export type SalesCfg = { enabled: boolean; followup: boolean; discount: number; notes: string };
export const DEFAULT_SALES: SalesCfg = { enabled: false, followup: true, discount: 0, notes: "" };
export type Seen = { at: string; user?: string; followed?: string; day?: string; n?: number };
export type Need = { igsid: string; user?: string; said: string; why: string; at: string };
export type SalesLog = { at: string; igsid: string; user?: string; said: string; reply: string; kind: "reply" | "followup"; buttons?: boolean; needs?: string };

// key: pasted on the Orders page (Redis), or Vercel env GEMINI_API_KEY
export const getKey = async () => process.env.GEMINI_API_KEY || (await get<string>("sales_key", "")) || "";
export const hasKey = async () => !!(await getKey());
export const keyHint = async () => { const k = await getKey(); return k ? "…" + k.slice(-4) : ""; };
// check a key with Google before saving it
export async function testKey(k: string) {
  try {
    const r = await fetch("https://generativelanguage.googleapis.com/v1beta/models?pageSize=1", { headers: { "x-goog-api-key": k }, cache: "no-store", signal: AbortSignal.timeout(15_000) });
    if (r.ok) return { ok: true };
    const j = await r.json().catch(() => ({}));
    return { ok: false, error: String(j?.error?.message || `Google said ${r.status}`).slice(0, 200) };
  } catch (e: any) { return { ok: false, error: e.message.slice(0, 200) }; }
}
export async function getSales(): Promise<SalesCfg> { return { ...DEFAULT_SALES, ...(await get<Partial<SalesCfg>>("sales_ai", {})) }; }
export const saveSales = (c: SalesCfg) => set("sales_ai", c);
export const getPaused = () => get<string[]>("sales_paused", []);
export const getNeeds = () => get<Record<string, Need>>("sales_needs", {});
export const saveNeeds = (n: Record<string, Need>) => set("sales_needs", n);
export const getSalesLog = (n = 40) => getList("sales_log", n) as Promise<SalesLog[]>;
const getSeen = () => get<Record<string, Seen>>("sales_seen", {});

// tried in order: Google often answers "high demand" (503) on one model while another is free
const MODELS = [...(process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : []), "gemini-3.8-flash", "gemini-3.5-flash", "gemini-flash-latest", "gemini-3.1-flash-lite"];
const MAX_AI_PER_DAY = 12; // per person, so a chatty or looping chat can't run up the bill

type Out = { reply: string; pay_buttons: boolean; needs_owner: boolean; owner_note: string };
const SCHEMA = {
  type: "OBJECT",
  properties: {
    reply: { type: "STRING", description: "The DM to send, plain text. Empty string if no reply is needed (e.g. they just said thanks/ok after we already answered)." },
    pay_buttons: { type: "BOOLEAN", description: "true to show the PayPal / Crypto buttons under the reply (when they are ready to pay or ask how to pay)." },
    needs_owner: { type: "BOOLEAN", description: "true when a human must step in: refund, complaint, payment problem, custom deal, anything you are not sure about." },
    owner_note: { type: "STRING", description: "If needs_owner: one short line for the owner on what they need. Otherwise empty." },
  },
  required: ["reply", "pay_buttons", "needs_owner", "owner_note"],
};


const SYSTEM = (oc: OrderCfg, s: SalesCfg) => `You are the DM assistant of @git.mate, an Instagram page (dark, motion-design reels) that features GitHub repos and side projects. You reply to people who DM us, mostly developers who saw our ad ("built something nobody saw? DM us FEATURE / yes, we handle it all") and want their project featured. Your job: help them, answer honestly, and turn interest into a booked, paid feature. You write like a friendly founder texting, not a salesperson.

WHAT WE SELL
- A featured reel on @git.mate: $${oc.price} one time${s.discount > 0 && s.discount < oc.price ? ` (you MAY offer $${s.discount} if they hesitate on price, only once, as "if you book today")` : ""}. No other prices, no packages, no free features (do not offer or promise anything free).
- What they get: a full custom motion reel (around 30s, voiceover, made from their real repo, screenshots and demo), posted on @git.mate with their GitHub link in the caption and their Instagram tagged, on a fixed date we give them. We do all the work: script, design, voice, editing, posting. They only send the link.
- Proof it works: our reel about the "atlas" repo got 111k+ views, 5.7k saves, 2.2k shares and 1,200+ new follows. Typical reels get a few thousand views. Never promise views, stars, followers or virality; say results depend on the project and the reel, and we make it as strong as we can.
- How to book: 1) pay $${oc.price} (PayPal, or USDC on Solana) using the buttons, 2) send the GitHub repo (or project) link here, 3) send the payment screenshot (or Solana tx link) here. Our team checks it and DMs them their date, usually within a day. Reels go out after that, usually within a week depending on the queue.
- Payment methods: ${[oc.paypal && "PayPal", oc.usdc && "USDC on Solana"].filter(Boolean).join(", ") || "(not set up yet, say the team will send payment details)"}. Never type payment emails or addresses yourself: set pay_buttons true and tell them to tap the button, the details arrive automatically.
- Any project works: GitHub repos, apps (Play Store/App Store), websites, open source tools, AI projects. If it's private, a demo video or screenshots are enough.
- To get the link of a repo from one of our reels, they should comment "gitmate" on that reel.

RULES
- Never say a payment is received, verified or confirmed, and never give a date: only our team does that after checking.
- Never invent facts about us beyond the above. If unsure, say you'll check with the team and set needs_owner true.
- Refunds, complaints, failed payments, partnerships, bulk deals, press, anything unusual: short polite holding reply and needs_owner true.
- Reply in the language they use (English, Hinglish, Hindi...). Keep it short: 1 to 3 short sentences like a real DM, at most one emoji or two. No markdown, no bullet lists unless they ask how it works.
- Move them one step forward each time (ask for the link, point to the pay buttons, or answer the doubt then ask for the link). Don't repeat the full offer if they already got it.
- If they say no or not now, be kind, don't push.
- Messages from "US" in the chat include automatic messages (offer, payment details); treat them as already sent.
${s.notes ? `\nOWNER NOTES (follow these):\n${s.notes}` : ""}`;

const orderLine = (o?: Order) => !o ? "No order yet."
  : `Order status: ${o.status}${o.repo ? `, repo/link sent: ${o.repo}` : ", no repo link yet"}${o.proof?.length ? `, payment proof sent (${o.proof.length})` : ", no payment proof yet"}${o.date ? `, booked for ${o.date}` : ""}${o.notes?.length ? `, notes: ${o.notes.join("; ")}` : ""}.`;

// Ask Claude for the next DM. mode "followup" = they went quiet, one gentle nudge.
async function draft(igsid: string, latest: string, mode: "reply" | "followup") {
  const cfg = await getConfig(); const tok = ig.replyTokenFor(cfg);
  const [oc, s, orders] = await Promise.all([getOrderCfg(), getSales(), getOrders()]);
  const o = orders.find((x) => x.igsid === igsid);
  let msgs: ig.IgMsg[] = [];
  try { msgs = await ig.convoWith(cfg.ig_user_id!, tok, igsid, 20); } catch (e: any) { await log("warn", `Sales AI: could not read chat: ${e.message.slice(0, 120)}`); }
  const chat = msgs.slice().reverse().map((m) => `${m.from?.id === igsid ? "THEM" : "US"}: ${(m.message || "[photo/attachment]").slice(0, 600)}`);
  if (mode === "reply" && latest && !chat.some((l) => l.startsWith("THEM: " + latest.slice(0, 40)))) chat.push(`THEM: ${latest.slice(0, 600)}`);
  const task = mode === "reply"
    ? "Write our next reply to their latest message."
    : "They went quiet after showing interest. Write ONE short, friendly follow-up nudge (no pressure) that moves them to the next step. If the chat shows they declined or it's not a sales chat, return an empty reply.";
  const key = await getKey(); const t0 = Date.now();
  const body = JSON.stringify({
    systemInstruction: { parts: [{ text: SYSTEM(oc, s) }] },
    contents: [{ role: "user", parts: [{ text: `Instagram user: @${o?.user || "unknown"}\n${orderLine(o)}\n\nChat so far (oldest first):\n${chat.join("\n") || "(empty)"}\n\n${task}` }] }],
    generationConfig: { temperature: 0.6, maxOutputTokens: 2000, responseMimeType: "application/json", responseSchema: SCHEMA },
  });
  let j: any = null; let err = "";
  for (const model of MODELS) {
    const left = 50_000 - (Date.now() - t0); if (left < 5_000) break; // stay inside the webhook's 60s
    try {
      const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
        method: "POST", cache: "no-store", signal: AbortSignal.timeout(Math.min(20_000, left)),
        headers: { "content-type": "application/json", "x-goog-api-key": key }, body,
      });
      const b = await r.json().catch(() => ({}));
      if (r.ok && b?.candidates?.[0]?.content) { j = b; break; }
      err = `${model} ${r.status}: ${String(b?.error?.message || "empty answer").slice(0, 120)}`;
      if (r.status === 400 || r.status === 401 || r.status === 403) break; // bad key / request: other models won't help
    } catch (e: any) { err = `${model}: ${e.message.slice(0, 120)}`; }
  }
  if (!j) throw new Error(`Gemini: ${err}`);
  try {
    const o2 = JSON.parse(j?.candidates?.[0]?.content?.parts?.map((p: any) => p.text || "").join("") || "") as Out;
    return { reply: String(o2.reply || ""), pay_buttons: !!o2.pay_buttons, needs_owner: !!o2.needs_owner, owner_note: String(o2.owner_note || "") };
  } catch { return { reply: "", pay_buttons: false, needs_owner: true, owner_note: "AI could not answer this one" }; }
}

async function send(igsid: string, text: string, buttons: boolean) {
  const cfg = await getConfig(); const tok = ig.replyTokenFor(cfg); const oc = await getOrderCfg();
  const q = buttons ? [...(oc.paypal ? [{ title: "💳 PayPal", payload: "GM_PAY_PAYPAL" }] : []), ...(oc.usdc ? [{ title: "🪙 Crypto (USDC)", payload: "GM_PAY_USDC" }] : [])] : [];
  if (q.length) { try { await ig.sendQR(cfg.ig_user_id!, tok, igsid, text, q); return; } catch {} }
  await ig.sendDM(cfg.ig_user_id!, tok, igsid, text.slice(0, 1000));
}

// every incoming DM: remember when they last wrote (for the 24h follow-up window)
export async function noteInbound(igsid: string) {
  const seen = await getSeen(); const now = new Date().toISOString();
  seen[igsid] = { ...(seen[igsid] || {}), at: now };
  for (const [k, v] of Object.entries(seen)) if (Date.now() - Date.parse(v.at) > 3 * 864e5) delete seen[k];
  await set("sales_seen", seen);
}

// A DM none of the fixed flows handled: let the AI answer. Returns true when it replied.
export async function salesReply(m: { igsid: string; mid: string; text: string }) {
  if (!m.text.trim() || !(await hasKey())) return false;
  const s = await getSales();
  if (!s.enabled || (await getPaused()).includes(m.igsid)) return false;
  if (!(await lock("sai:" + m.mid, 3600))) return true;
  const seen = await getSeen(); const day = new Date().toISOString().slice(0, 10);
  const me = seen[m.igsid] || { at: new Date().toISOString() };
  if (me.day === day && (me.n || 0) >= MAX_AI_PER_DAY) return false;
  try {
    const out = await draft(m.igsid, m.text, "reply");
    const cfg = await getConfig(); const user = (await ig.userName(m.igsid, ig.replyTokenFor(cfg))) || undefined;
    if (out.reply.trim()) await send(m.igsid, out.reply.trim(), out.pay_buttons);
    if (out.needs_owner) { const n = await getNeeds(); n[m.igsid] = { igsid: m.igsid, user, said: m.text.slice(0, 300), why: out.owner_note || "needs you", at: new Date().toISOString() }; await saveNeeds(n); }
    await pushList("sales_log", { at: new Date().toISOString(), igsid: m.igsid, user, said: m.text.slice(0, 300), reply: out.reply, kind: "reply", buttons: out.pay_buttons, needs: out.needs_owner ? out.owner_note : undefined } satisfies SalesLog, 300);
    const s2 = await getSeen(); s2[m.igsid] = { ...(s2[m.igsid] || me), user, day, n: (me.day === day ? me.n || 0 : 0) + 1 }; await set("sales_seen", s2);
    return true;
  } catch (e: any) {
    await log("error", `Sales AI: ${e.message.slice(0, 200)}`);
    return false;
  }
}

// Cron: one gentle nudge to people who got the offer but sent nothing, 3h-20h after their last message
export async function salesFollowups(max = 3) {
  if (!(await hasKey())) return { skipped: "no key" };
  const s = await getSales();
  if (!s.enabled || !s.followup) return { skipped: "off" };
  if (!(await lock("sales_fu", 240))) return { skipped: "busy" };
  const [orders, seen, paused] = await Promise.all([getOrders(), getSeen(), getPaused()]);
  let sent = 0;
  for (const o of orders) {
    if (sent >= max) break;
    const v = seen[o.igsid]; if (!v || v.followed || paused.includes(o.igsid)) continue;
    if (o.status !== "asked" || (o.repo && o.proof?.length)) continue;
    const age = Date.now() - Date.parse(v.at);
    if (age < 3 * 3600e3 || age > 20 * 3600e3) continue;
    const s2 = await getSeen(); s2[o.igsid] = { ...v, followed: new Date().toISOString() }; await set("sales_seen", s2);
    try {
      const out = await draft(o.igsid, "", "followup");
      if (!out.reply.trim()) continue;
      await send(o.igsid, out.reply.trim(), out.pay_buttons);
      await pushList("sales_log", { at: new Date().toISOString(), igsid: o.igsid, user: o.user, said: "(went quiet)", reply: out.reply, kind: "followup", buttons: out.pay_buttons } satisfies SalesLog, 300);
      sent++;
    } catch (e: any) { await log("warn", `Sales AI follow-up: ${e.message.slice(0, 160)}`); }
  }
  return { sent };
}
