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
export type FreeRepo = { repo: string; igsid: string; user?: string; at: string; status: "new" | "featured" | "dismissed" };
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

// next day (from tomorrow) that has fewer than per_day booked paid reels
export async function nextFreeDate(cfgTz: string, perDay: number, orders: Order[]) {
  const q = await getQueue();
  const taken: Record<string, number> = {};
  for (const o of orders) if (o.date && ["confirmed", "made"].includes(o.status)) taken[o.date] = (taken[o.date] || 0) + 1;
  for (const it of q) if (it.post_on && it.status === "queued" && !orders.some((o) => o.item_id === it.id)) taken[it.post_on] = (taken[it.post_on] || 0) + 1;
  const today = tzParts(cfgTz).day;
  let d = new Date(today + "T12:00:00Z");
  for (let i = 0; i < 120; i++) {
    d = new Date(d.getTime() + 864e5);
    const k = d.toISOString().slice(0, 10);
    if ((taken[k] || 0) < perDay) return k;
  }
  return "";
}
export const niceDate = (d: string) => new Date(d + "T12:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long" });

const OFFER = (c: OrderCfg) => `Hey! 👋 Thanks for wanting to feature your repo on @git.mate 🚀

⚡ $${c.price} one time
→ a full motion reel made for your repo
→ posted on @git.mate with your GitHub link + tag
→ you get a fixed date

How to book:
1. Pay $${c.price}${c.paypal ? `\n   PayPal: ${c.paypal}` : ""}${c.usdc ? `\n   or ${c.price} USDC (Solana): ${c.usdc}` : ""}
2. Send your GitHub repo link here
3. Send the payment screenshot (or the Solana tx link) here

We'll confirm and send you your date 🙌`;

// One incoming DM (from the webhook). Returns true when it was an order/repo message.
export async function handleOrderDM(m: { igsid: string; mid: string; text: string; images: string[] }) {
  const t = m.text || "";
  const wantsFeature = /\bfeature\b/i.test(t);
  const repo = repoOf(t);
  const tx = TX_RE.exec(t)?.[1];
  if (!wantsFeature && !repo && !tx && !m.images.length) return false;
  const orders = await getOrders();
  let o = orders.find((x) => x.igsid === m.igsid && ["asked", "proof"].includes(x.status));
  if (!wantsFeature && !o && !repo) return false;
  if (!(await lock("om:" + m.mid, 3600))) return true; // already handled (Meta retries)
  const cfg = await getConfig(); const tok = ig.replyTokenFor(cfg); const oc = await getOrderCfg();
  const now = new Date().toISOString();
  const name = async () => (await ig.userName(m.igsid, tok)) || undefined;
  const say = async (text: string) => { try { await ig.sendDM(cfg.ig_user_id!, tok, m.igsid, text); } catch (e: any) { await log("warn", `Orders: DM failed: ${e.message.slice(0, 160)}`); } };

  // free repo submission (no open paid order)
  if (!o && !wantsFeature && repo) {
    const free = await getFree();
    if (!free.some((f) => f.repo.toLowerCase() === repo.toLowerCase())) {
      free.unshift({ repo, igsid: m.igsid, user: await name(), at: now, status: "new" }); await saveFree(free.slice(0, 500));
    }
    return true;
  }
  if (!o) {
    o = { id: m.igsid, igsid: m.igsid, user: await name(), status: "asked", created_at: now, updated_at: now, proof: [], notes: [] };
    orders.unshift(o);
    if (wantsFeature) await say(OFFER(oc));
  } else if (wantsFeature && !repo && !m.images.length && !tx) {
    await say(OFFER(oc)); // asked again
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
    await say("Got it, thank you! ✅ We're checking your payment now and will send you your reel date here soon 🚀");
    await log("info", `Orders: new paid order to confirm (${o.repo})`);
  } else if (o.status === "asked" && (repo || m.images.length || tx)) {
    await say(!o.repo ? "Thanks! 🙌 Now send your GitHub repo link here." : "Thanks! 🙌 Now send the payment screenshot (or the Solana tx link) here.");
  }
  return true;
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
  const orders = await getOrders(); const o = orders.find((x) => x.item_id === itemId);
  if (!o || o.status === "live") return;
  o.status = "live"; o.updated_at = new Date().toISOString(); await saveOrders(orders);
  const cfg = await getConfig();
  try { await ig.sendDM(cfg.ig_user_id!, ig.replyTokenFor(cfg), o.igsid, `Your reel is live! 🚀🔥\n${permalink || "Check @git.mate"}\n\nThanks for building cool stuff 🙌`); }
  catch { o.notes = [...(o.notes || []), "live DM failed (24h window), tell them yourself"]; await saveOrders(orders); }
}
