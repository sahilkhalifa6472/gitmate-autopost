import { getAr, saveAr, arEvents, runAutoReply } from "@/lib/autoreply";
import { getQueue, saveQueue, log } from "@/lib/data";
import { allowed, loggedIn, deny } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

const isUrl = (s: unknown) => typeof s === "string" && /^https?:\/\/\S+$/.test(s.trim());

export async function GET(req: Request) {
  if (!(await allowed(req))) return deny();
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
  const ar = await getAr();
  if (isUrl(b.default_link)) { ar.default_link = b.default_link.trim(); await saveAr(ar); }
  return Response.json({ ok: true, updated: n });
}
