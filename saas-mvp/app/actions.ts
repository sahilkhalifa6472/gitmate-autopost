"use server";
import { revalidatePath } from "next/cache";
import { loggedIn } from "@/lib/guard";
import * as ig from "@/lib/ig";
import { account, patchAccount, removeAccount, posts, savePosts, newId, Rule, log } from "@/lib/data";
import { aiReady, aiReply, Turn } from "@/lib/ai";
import { setPaused, tick } from "@/lib/engine";

async function must() { if (!(await loggedIn())) throw new Error("Please log in again"); }
const s = (f: FormData, k: string) => String(f.get(k) || "").trim();

// ---- accounts
export async function disconnect(f: FormData) { await must(); await removeAccount(s(f, "a")); revalidatePath("/"); }
export async function saveReplyToken(f: FormData) {
  await must(); const t = s(f, "reply_token");
  await patchAccount(s(f, "a"), { reply_token: t || undefined }); revalidatePath("/");
}
export async function runNow() { await must(); await tick(); revalidatePath("/"); }

// ---- posts
export async function addPost(input: { a: string; video_url: string; caption: string; at: number }) {
  await must();
  if (!input.video_url || !(await account(input.a))) throw new Error("Video or account missing");
  const list = await posts();
  list.push({ id: newId(), account: input.a, video_url: input.video_url, caption: input.caption.slice(0, 2200), at: input.at || Date.now(), status: "scheduled" });
  await savePosts(list); revalidatePath("/posts");
}
export async function deletePost(f: FormData) {
  await must(); await savePosts((await posts()).filter((p) => p.id !== s(f, "id"))); revalidatePath("/posts");
}
export async function retryPost(f: FormData) {
  await must(); const list = await posts(); const p = list.find((x) => x.id === s(f, "id"));
  if (p) { p.status = "scheduled"; p.at = Date.now(); p.error = undefined; p.creation_id = undefined; await savePosts(list); }
  revalidatePath("/posts");
}

// ---- comment keyword rules
export async function saveRule(f: FormData) {
  await must(); const acc = await account(s(f, "a")); if (!acc) return;
  const r: Rule = { id: newId(), keyword: s(f, "keyword"), dm_text: s(f, "dm_text").slice(0, 900), link: s(f, "link") || undefined,
    button: s(f, "button") || undefined, public_reply: s(f, "public_reply") || undefined, on: true, created: Date.now() };
  if (!r.keyword || !r.dm_text) return;
  if (r.link) r.dm_text = r.dm_text.slice(0, 80); // card titles are max 80 characters
  await patchAccount(acc.id, { rules: [...acc.rules, r] }); revalidatePath("/rules");
}
export async function toggleRule(f: FormData) {
  await must(); const acc = await account(s(f, "a")); if (!acc) return;
  await patchAccount(acc.id, { rules: acc.rules.map((r) => (r.id === s(f, "id") ? { ...r, on: !r.on, created: !r.on ? Date.now() : r.created } : r)) });
  revalidatePath("/rules");
}
export async function deleteRule(f: FormData) {
  await must(); const acc = await account(s(f, "a")); if (!acc) return;
  await patchAccount(acc.id, { rules: acc.rules.filter((r) => r.id !== s(f, "id")) }); revalidatePath("/rules");
}

// ---- AI
export async function saveBrain(f: FormData) {
  await must();
  await patchAccount(s(f, "a"), { brain: s(f, "brain").slice(0, 12000), goal: s(f, "goal").slice(0, 400), tone: s(f, "tone").slice(0, 200) });
  revalidatePath("/ai");
}
export async function toggleAi(f: FormData) {
  await must(); const acc = await account(s(f, "a")); if (!acc) return;
  await patchAccount(acc.id, { ai_on: !acc.ai_on });
  await log(acc.id, "ai", acc.ai_on ? "AI turned OFF" : "AI turned ON");
  revalidatePath("/ai");
}
// test chat on the AI page: nothing is sent to Instagram
export async function testAi(a: string, turns: Turn[]) {
  await must(); const acc = await account(a);
  if (!acc) return { reply: "", handoff: true, reason: "No account" };
  if (!aiReady()) return { reply: "", handoff: true, reason: "ANTHROPIC_API_KEY Vercel me set nahi hai" };
  try { return await aiReply(acc, turns); } catch (e: any) { return { reply: "", handoff: true, reason: e.message.slice(0, 200) }; }
}

// ---- inbox
export async function sendReply(f: FormData) {
  await must(); const acc = await account(s(f, "a")); const to = s(f, "to"); const text = s(f, "text");
  if (!acc || !to || !text) return;
  try { await ig.sendDM(acc.id, acc.reply_token || acc.token, to, text); await log(acc.id, "dm", `You replied: ${text.slice(0, 80)}`); }
  catch (e: any) { await log(acc.id, "dm", `Reply failed: ${e.message}`, false); }
  revalidatePath("/inbox");
}
export async function pauseAi(f: FormData) {
  await must(); await setPaused(s(f, "a"), s(f, "to"), s(f, "on") === "1"); revalidatePath("/inbox");
}
