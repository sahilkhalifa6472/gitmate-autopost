// Paid "feature your repo" orders + free repo submissions, fed by Instagram DM webhooks.
// Flow: user DMs FEATURE -> offer + payment details -> user sends repo link + payment proof
// -> owner presses Confirm on the Orders page -> next free date is booked and the user gets a DM.
import { put } from "@vercel/blob";
import * as ig from "./ig";
import { get, set, lock } from "./store";
import { getConfig, getQueue, log } from "./data";
import { tzParts } from "./time";

export type Order = {
  id: string;                 // igsid (one open paid order per user)
  igsid: string;
  user?: string;
  repo?: string;
  status: "asked" | "proof" | "confirmed" | "made" | "live" | "rejected";
  proof?: { kind: "image" | "tx"; url: string; verified?: boolean; note?: string }[];
  date?: string;              // YYYY-MM-DD booked post day (dashboard timezone)
  item_id?: number;           // queue item made for it
  notes?: string[];
  created_at: string;
  updated_at: string;
};
// Repos people DM'd before paid spots started (owner rule 2026-11-14): made for free, one a day, as bait.
// status: new (waiting) -> featured (reel in queue) -> live (posted, share it with them) ; dismissed = skip
export type FreeRepo = { repo: string; igsid: string; user?: string; at: string; status: "new" | "featured" | "live" | "dismissed"; legacy?: boolean; item_id?: number; permalink?: string; shared?: boolean; dm?: string };
// DMs before this moment count as "old" (free); repo links after it get the paid offer
export const FREE_CUTOFF = "2026-11-14T00:00:00Z";
export type OrderCfg = { price: number; paypal: string; usdc: string; per_day: number };
export const DEFAULT_ORDER_CFG: OrderCfg = { price: 9, paypal: "", usdc: "", per_day: 1 };

export const getOrders = () => get<Order[]>("orders", []);
export const saveOrders = (o: Order[]) => set("orders", o);
export const getFree = () => get<FreeRepo[]>("free_repos", []);
export const saveFree = (f: FreeRepo[]) => set("free_repos", f);
export async function getOrderCfg(): Promise<OrderCfg> { return { ...DEFAULT_ORDER_CFG, ...(await get<Partial<OrderCfg>>("order_cfg", {})) }; }

const REPO_RE = /github\.com\/([\w.-]+)\/([\w.-]+)/i;
const TX_RE = /(?:solscan\.io\/tx\/|explorer\.solana\.com\/tx\/|solana\.fm\/tx\/)?\b([1-9A-HJ-NP-Za-km-z]{80,90})\b/;
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
export const repoOf = (t: string) => { const m = REPO_RE.exec(t || ""); return m ? `https://github.com/${m[1]}/${m[2].replace(/\.git$|[.,)]+$/g, "")}` : ""; };

// Was at least `price` USDC sent to our wallet in this Solana transaction?
export async function checkSolanaTx(sig: string, wallet: string, price: number) {
  try {
    const r = await fetch("https://api.mainnet-beta.solana.com", { method: "POST", headers: { "content-type": "application/json" }, cache: "no-store",
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "getTransaction", params: [sig, { encoding: "jsonParsed", maxSupportedTransactionVersion: 0, commitment: "confirmed" }] }) });
    const j = await r.json(); const m = j?.result?.meta;
    if (!m) return { ok: false, note: "transaction not found yet" };
    if (m.err) return { ok: false, note: "transaction failed on chain" };
    const bal = (arr: any[]) => (arr || []).filter((b) => b.mint === USDC_MINT && b.owner === wallet).reduce((s, b) => s + Number(b.uiTokenAmount?.uiAmount || 0), 0);
    const got = +(bal(m.postTokenBalances) - bal(m.preTokenBalances)).toFixed(6);
    return got >= price * 0.98 ? { ok: true, note: `${got} USDC received` } : { ok: false, note: got > 0 ? `only ${got} USDC received` : "no USDC to our wallet in this tx" };
  } catch (e: any) { return { ok: false, note: "could not check: " + e.message.slice(0, 80) }; }
}

// next day (from the day after tomorrow) that has fewer than per_day booked paid reels
export async function nextFreeDate(cfgTz: string, perDay: number, orders: Order[]) {
  const q = await getQueue();
  const taken: Record<string, number> = {};
  for (const o of orders) if (o.date && ["confirmed", "made"].includes(o.status)) taken[o.date] = (taken[o.date] || 0) + 1;
  for (const it of q) if (it.post_on && it.status === "queued" && !orders.some((o) => o.item_id === it.id)) taken[it.post_on] = (taken[it.post_on] || 0) + 1;
  const today = tzParts(cfgTz).day;
  // earliest is the day after tomorrow, so the daily reel task has a run to make it
  let d = new Date(Date.parse(today + "T12:00:00Z") + 864e5);
  for (let i = 0; i < 120; i++) {
    d = new Date(d.getTime() + 864e5);
    const k = d.toISOString().slice(0, 10);
    if ((taken[k] || 0) < perDay) return k;
  }
  return "";
}
export const niceDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long" });

const OFFER_BODY = (c: OrderCfg) => `⚡ $${c.price} one time
→ a full motion reel made for your repo
→ posted on @git.mate with your GitHub link + tag
→ you get a fixed date

How to book:
1. Pay $${c.price} (tap PayPal or Crypto below 👇)
2. Send your GitHub repo link here
3. Send the payment screenshot (or the Solana tx link) here

We'll confirm and send you your date 🙌`;
const OFFER = (c: OrderCfg) => `Hey! 👋 Thanks for wanting to feature your repo on @git.mate 🚀\n\n${OFFER_BODY(c)}`;
const PAY_QR = (c: OrderCfg) => [
  ...(c.paypal ? [{ title: "💳 PayPal", payload: "GM_PAY_PAYPAL" }] : []),
  ...(c.usdc ? [{ title: "🪙 Crypto (USDC)", payload: "GM_PAY_USDC" }] : []),
];

// One incoming DM (from the webhook). Returns true when it was an order/repo message.
export async function handleOrderDM(m: { igsid: string; mid: string; text: string; images: string[]; payload?: string }) {
  const t = m.text || "";
  // payment method picked (button tap, or typed "paypal" / "crypto")
  const pay = m.payload === "GM_PAY_PAYPAL" || /^\W*pay\s*pal\W*$/i.test(t) ? "paypal"
    : m.payload === "GM_PAY_USDC" || /^\W*(crypto|usdc|solana|sol)(\s*\(usdc\))?\W*$/i.test(t) ? "usdc" : "";
  if (pay) return payMethod(m.igsid, m.mid, pay);
  const wantsFeature = /\bfeature\b/i.test(t);
  const tx = TX_RE.exec(t)?.[1];
  const anyUrl = /https?:\/\/[^\s]+/i.exec(t)?.[0].replace(/[.,)]+$/, "") || "";
  if (!wantsFeature && !anyUrl && !tx && !m.images.length) return false;
  const orders = await getOrders();
  let o = orders.find((x) => x.igsid === m.igsid && ["asked", "proof"].includes(x.status));
  // GitHub link, or (for someone with an open order) any project link like a Play Store / website URL
  const repo = repoOf(t) || (o && anyUrl && !/solscan|solana\.fm|explorer\.solana|paypal\.(com|me)/i.test(anyUrl) ? anyUrl : "");
  if (!wantsFeature && !o && !repo) return false;
  if (!(await lock("om:" + m.mid, 3600))) return true; // already handled (Meta retries)
  const cfg = await getConfig(); const tok = ig.replyTokenFor(cfg); const oc = await getOrderCfg();
  const now = new Date().toISOString();
  const name = async () => (await ig.userName(m.igsid, tok)) || undefined;
  const say = async (text: string) => { try { await ig.sendDM(cfg.ig_user_id!, tok, m.igsid, text); } catch (e: any) { await log("warn", `Orders: DM failed: ${e.message.slice(0, 160)}`); } };
  const offer = async (text: string) => {
    const q = PAY_QR(oc);
    if (!q.length) return say(text);
    try { await ig.sendQR(cfg.ig_user_id!, tok, m.igsid, text, q); } catch { await say(text); }
  };

  // repo link from someone whose repo is already on the old free list: nothing to sell, stay quiet
  if (!o && !wantsFeature && repo) {
    const free = await getFree();
    if (free.some((f) => f.igsid === m.igsid || f.repo.toLowerCase() === repo.toLowerCase())) return true;
  }
  if (!o) {
    o = { id: m.igsid, igsid: m.igsid, user: await name(), status: "asked", created_at: now, updated_at: now, proof: [], notes: [] };
    orders.unshift(o);
    // new repo links (no FEATURE) also get the paid offer now
    if (wantsFeature) await offer(OFFER(oc));
    else if (repo) await offer("Thanks for sharing your repo! 🙌 Featured spots on @git.mate are paid now:\n\n" + OFFER_BODY(oc));
  } else if (wantsFeature && !repo && !m.images.length && !tx) {
    await offer(OFFER(oc)); // asked again
  }
  if (repo) o.repo = repo;
  for (const url of m.images) {
    let keep = url;
    try { const img = await fetch(url); if (img.ok) { const b = await img.arrayBuffer(); keep = (await put(`orders/${m.igsid}-${Date.now()}.jpg`, Buffer.from(b), { access: "public", contentType: img.headers.get("content-type") || "image/jpeg", addRandomSuffix: true })).url; } } catch {}
    o.proof = [...(o.proof || []), { kind: "image", url: keep }];
  }
  if (tx) {
    const v = oc.usdc ? await checkSolanaTx(tx, oc.usdc, oc.price) : { ok: false, note: "no USDC wallet set" };
    o.proof = [...(o.proof || []), { kind: "tx", url: `https://solscan.io/tx/${tx}`, verified: v.ok, note: v.note }];
  }
  const had = o.status;
  if (o.repo && o.proof?.length) o.status = "proof";
  o.updated_at = now;
  await saveOrders(orders);
  if (had !== "proof" && o.status === "proof") {
    const okTx = (o.proof || []).some((p) => p.kind === "tx" && p.verified);
    const viaPaypal = (o.notes || []).includes("pays with PayPal") || (!okTx && (o.proof || []).some((p) => p.kind === "image"));
    await say(okTx
      ? "Payment verified on chain ✅ Thank you! We'll send you your reel date here very soon 🚀"
      : viaPaypal
        ? "Got it, thank you! ✅ Our team is checking your PayPal payment now and will message you here with your reel date soon 🚀"
        : "Got it, thank you! ✅ Our team is checking your payment now and will message you here with your reel date soon 🚀");
    await log("info", `Orders: new paid order to confirm (${o.repo})`);
  } else if (o.status === "asked" && had === "asked" && o.created_at !== now && (repo || m.images.length || tx)) {
    await say(!o.repo ? "Thanks! 🙌 Now send your GitHub repo (or project) link here." : "Thanks! 🙌 Now send the payment screenshot (or the Solana tx link) here.");
  }
  return true;
}

// PayPal / Crypto button: send only that payment's details (address in its own message so it's easy to copy)
async function payMethod(igsid: string, mid: string, pay: "paypal" | "usdc") {
  if (!(await lock("om:" + mid, 3600))) return true;
  const cfg = await getConfig(); const tok = ig.replyTokenFor(cfg); const oc = await getOrderCfg();
  const orders = await getOrders(); const now = new Date().toISOString();
  let o = orders.find((x) => x.igsid === igsid && ["asked", "proof"].includes(x.status));
  if (!o) { o = { id: igsid, igsid, user: (await ig.userName(igsid, tok)) || undefined, status: "asked", created_at: now, updated_at: now, proof: [], notes: [] }; orders.unshift(o); }
  o.notes = [...(o.notes || []).filter((n) => !n.startsWith("pays with")), `pays with ${pay === "paypal" ? "PayPal" : "USDC"}`]; o.updated_at = now;
  await saveOrders(orders);
  const dest = pay === "paypal" ? oc.paypal : oc.usdc;
  const first = pay === "paypal" ? `💳 PayPal: send $${oc.price} to this email 👇` : `🪙 Send ${oc.price} USDC on the Solana network to this address 👇`;
  const after = pay === "paypal"
    ? `After paying, send here:\n1. your GitHub repo link\n2. the payment screenshot\n\nWe'll confirm and send you your date 🙌`
    : `After sending, paste here:\n1. your GitHub repo link\n2. the Solana tx link (we verify it automatically ⚡)\n\nOnly USDC on Solana please, other tokens or networks get lost.`;
  try {
    if (!dest) throw new Error("not set");
    for (const t of [first, dest, after]) await ig.sendDM(cfg.ig_user_id!, tok, igsid, t);
  } catch (e: any) { await log("warn", `Orders: pay-method DM failed: ${e.message.slice(0, 160)}`); }
  return true;
}

// owner pressed Reject: let them know politely (best effort, 24h window)
export async function rejectDM(o: Order) {
  const cfg = await getConfig();
  const paid = (o.proof || []).length > 0;
  const text = paid
    ? "Hey! 🙏 Sorry, we couldn't verify your payment for this one. If you did pay, just reply here with the details and our team will sort it out (or refund you) 🙌"
    : "Hey! 🙏 Thanks for reaching out. We can't feature this one right now, but keep building, and feel free to send us another project anytime 🙌";
  try { await ig.sendDM(cfg.ig_user_id!, ig.replyTokenFor(cfg), o.igsid, text); return "sent"; }
  catch { o.notes = [...(o.notes || []), "reject DM failed (24h window), tell them yourself"]; return "failed"; }
}

// owner pressed Confirm: book the next free date and tell the user
export async function confirmOrder(id: string, date?: string) {
  const orders = await getOrders(); const o = orders.find((x) => x.id === id);
  if (!o) return { error: "not found" };
  const cfg = await getConfig(); const oc = await getOrderCfg();
  o.date = date && /^\d{4}-\d{2}-\d{2}$/.test(date) ? date : await nextFreeDate(cfg.timezone, oc.per_day, orders.filter((x) => x !== o));
  o.status = "confirmed"; o.updated_at = new Date().toISOString();
  await saveOrders(orders);
  let dm = "sent";
  try { await ig.sendDM(cfg.ig_user_id!, ig.replyTokenFor(cfg), o.igsid, `Payment received ✅ Thank you!\n\nYour reel goes live on ${niceDate(o.date)} 🚀 We'll tag you when it's up.`); }
  catch (e: any) { dm = "DM failed (outside Instagram's 24h window?), tell them yourself"; o.notes = [...(o.notes || []), "confirm DM failed"]; await saveOrders(orders); }
  await log("ok", `Orders: confirmed ${o.repo || o.id} for ${o.date}`);
  return { ok: true, date: o.date, dm };
}

// after a paid reel is posted: tell the buyer (best effort, Instagram allows it only within 24h of their last message)
export async function notifyLive(itemId: number, permalink?: string) {
  await freeLive(itemId, permalink);
  const orders = await getOrders(); const o = orders.find((x) => x.item_id === itemId);
  if (!o || o.status === "live") return;
  o.status = "live"; o.updated_at = new Date().toISOString(); await saveOrders(orders);
  const cfg = await getConfig();
  try { await ig.sendDM(cfg.ig_user_id!, ig.replyTokenFor(cfg), o.igsid, `Your reel is live! 🚀🔥\n${permalink || "Check @git.mate"}\n\nThanks for building cool stuff 🙌`); }
  catch { o.notes = [...(o.notes || []), "live DM failed (24h window), tell them yourself"]; await saveOrders(orders); }
}

export const shareText = (f: FreeRepo, permalink?: string) =>
  `Hey${f.user ? " @" + f.user : ""}! 🚀 We featured your repo on @git.mate 🙌\n${permalink || f.permalink || ""}\n\nShare it with your followers / repost it, and thanks for building cool stuff 🔥`;

// an old free repo's reel was posted: mark it live and try to DM them (works only within Instagram's 24h window)
async function freeLive(itemId: number, permalink?: string) {
  const free = await getFree(); const f = free.find((x) => x.item_id === itemId);
  if (!f || f.status === "live") return;
  f.status = "live"; f.permalink = permalink; await saveFree(free);
  const cfg = await getConfig();
  try { await ig.sendDM(cfg.ig_user_id!, ig.replyTokenFor(cfg), f.igsid, shareText(f, permalink)); f.shared = true; f.dm = "sent"; }
  catch { f.dm = "auto DM not allowed (24h window), send it yourself"; }
  await saveFree(free);
}

// Pull every GitHub repo link people DM'd us before FREE_CUTOFF into the free list (one-time / re-runnable)
export async function importOldRepos() {
  const cfg = await getConfig(); const tok = ig.replyTokenFor(cfg);
  if (!tok || !cfg.ig_user_id) return { error: "Instagram not connected" };
  const convos = await ig.allConversations(cfg.ig_user_id, tok, 12, 50);
  const free = await getFree(); const orders = await getOrders();
  const paid = new Set(orders.filter((o) => o.repo).map((o) => o.repo!.toLowerCase()));
  let added = 0, seen = 0;
  for (const cv of convos) for (const msg of (cv.messages?.data || []).slice().reverse()) {
    const from = msg.from?.id; if (!from || from === cfg.ig_user_id || msg.created_time > FREE_CUTOFF.replace("Z", "+0000")) continue;
    const repo = repoOf(msg.message || ""); if (!repo) continue; seen++;
    if (paid.has(repo.toLowerCase()) || free.some((f) => f.repo.toLowerCase() === repo.toLowerCase())) continue;
    free.push({ repo, igsid: from, user: msg.from?.username, at: new Date(msg.created_time).toISOString(), status: "new", legacy: true }); added++;
  }
  for (const f of free) if (f.at < FREE_CUTOFF) f.legacy = true;
  free.sort((a, b) => a.at.localeCompare(b.at));
  await saveFree(free);
  await log("info", `Orders: imported ${added} old DM repos (${seen} links seen in ${convos.length} chats)`);
  return { ok: true, added, seen, chats: convos.length, waiting: free.filter((f) => f.status === "new").length };
}
