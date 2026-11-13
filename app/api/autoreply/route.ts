import { getAr, saveAr, arEvents, runAutoReply } from "@/lib/autoreply";
import { getQueue, saveQueue, log, getConfig } from "@/lib/data";
import * as ig from "@/lib/ig";
import { setReplyToken } from "@/lib/replytoken";
import { setRemove } from "@/lib/store";
import { allowed, loggedIn, deny } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const isUrl = (s: unknown) => typeof s === "string" && /^https?:\/\/\S+$/.test(s.trim());

export async function GET(req: Request) {
  if (!(await allowed(req))) return deny();
  if (new URL(req.url).searchParams.get("diag")) return Response.json(await diag());
  const ar = await getAr();
  return Response.json({ config: ar, events: await arEvents(100) });
}

// Dashboard: settings, per-post link, run now
export async function POST(req: Request) {
  if (!(await loggedIn())) return deny();
  const b = await req.json().catch(() => ({}));
  if (b.action === "run") return Response.json(await runAutoReply({ force: true }));
  const ar = await getAr();
  if (typeof b.enabled === "boolean") ar.enabled = b.enabled;
  if (typeof b.dm_enabled === "boolean") ar.dm_enabled = b.dm_enabled;
  if (typeof b.keyword === "string" && b.keyword.trim()) ar.keyword = b.keyword.trim().slice(0, 40);
  if (typeof b.dm_text === "string" && b.dm_text.includes("{link}")) ar.dm_text = b.dm_text.slice(0, 900);
  else if (typeof b.dm_text === "string") return Response.json({ error: "DM text must contain {link}" }, { status: 400 });
  if (typeof b.dm_inbox_text === "string") ar.dm_inbox_text = b.dm_inbox_text.slice(0, 900);
  if (typeof b.public_replies === "string") ar.public_replies = b.public_replies.split("\n").map((x: string) => x.trim()).filter(Boolean).slice(0, 20);
  if (typeof b.default_link === "string") ar.default_link = isUrl(b.default_link) ? b.default_link.trim() : "";
  if (b.max_per_run != null) ar.max_per_run = Math.max(1, Math.min(50, Number(b.max_per_run) || 15));
  if (b.media_id) {
    const id = String(b.media_id);
    if (isUrl(b.link)) ar.links[id] = b.link.trim(); else delete ar.links[id];
  }
  await saveAr(ar);
  if (typeof b.enabled === "boolean" || typeof b.dm_enabled === "boolean") await log("info", `Auto-reply: comments ${ar.enabled ? "ON" : "off"}, DMs ${ar.dm_enabled ? "ON" : "off"}`);
  return Response.json({ ok: true });
}

// Daily reel task (QUEUE_KEY): set links of queue items by slug, e.g. { links: { "improve": "https://github.com/shadcn/improve" } }
export async function PUT(req: Request) {
  if (!(await allowed(req))) return deny();
  const b = await req.json().catch(() => ({}));
  const q = await getQueue();
  let n = 0;
  for (const [slug, link] of Object.entries(b.links || {})) {
    const it = q.find((i) => i.slug === slug);
    if (it && isUrl(link)) { it.link = String(link).trim(); n++; }
  }
  if (n) { await saveQueue(q); await log("info", `Auto-reply: links set for ${n} reel(s)`); }
  // retry comments whose DM failed: take them out of the "done" set
  if (Array.isArray(b.retry_comment_ids)) for (const id of b.retry_comment_ids.slice(0, 200)) await setRemove("ar_done", String(id));
  if (typeof b.reply_token === "string") {
    const r = await setReplyToken(b.reply_token.trim());
    if (r.error) return Response.json(r, { status: 400 });
  }
  const ar = await getAr();
  if (Array.isArray(b.public_replies)) { ar.public_replies = b.public_replies.map((x: unknown) => String(x).trim()).filter(Boolean).slice(0, 20); await saveAr(ar); }
  if (isUrl(b.default_link)) { ar.default_link = b.default_link.trim(); await saveAr(ar); }
  return Response.json({ ok: true, updated: n });
}

// Read-only check: does the saved token actually see comments / DMs? (counts only, sends nothing)
async function diag() {
  const cfg = await getConfig();
  const t = ig.replyTokenFor(cfg);
  if (!t || !cfg.ig_user_id) return { error: "not connected" };
  const out: any = { user_id: cfg.ig_user_id, username: cfg.username, token_prefix: t.slice(0, 4), reply_token_at: cfg.reply_token_at };
  const tryIt = async (k: string, f: () => Promise<any>) => { try { out[k] = await f(); } catch (e: any) { out[k] = { error: e.message.slice(0, 300) }; } };
  await tryIt("me", () => (t.startsWith("EAA") ? ig.fbAccount(cfg.ig_user_id!, t) : ig.me(t)));
  let media: ig.IgMedia[] = [];
  await tryIt("media", async () => { media = await ig.listMedia(cfg.ig_user_id!, t, 6); return media.length; });
  out.posts = [];
  for (const m of media.slice(0, 4)) {
    const row: any = { id: m.id, at: m.timestamp, comments_count: m.comments_count };
    try { const c = await ig.listComments(m.id, t, 0, 2); row.fetched = c.length; row.keyword = c.filter((x) => /gitmate/i.test(x.text || "")).length; row.with_from = c.filter((x) => x.from).length; }
    catch (e: any) { row.error = e.message.slice(0, 200); }
    try { const r = await fetch(`${t.startsWith("EAA") ? "https://graph.facebook.com" : "https://graph.instagram.com"}/v23.0/${m.id}/comments?access_token=${encodeURIComponent(t)}`, { cache: "no-store" }); const b = await r.json(); row.plain = b.data ? b.data.length : b.error?.message?.slice(0, 150); }
    catch (e: any) { row.plain = String(e).slice(0, 100); }
    out.posts.push(row);
  }
  await tryIt("conversations", async () => (await ig.conversations(cfg.ig_user_id!, t, 10)).length);
  return out;
}
