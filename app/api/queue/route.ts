import { del } from "@vercel/blob";
import { getQueue, saveQueue, log, igCaption } from "@/lib/data";
import { allowed, loggedIn, deny } from "@/lib/guard";
import { Item } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await allowed(req))) return deny();
  const q = await getQueue();
  return Response.json({ count: q.length, max_id: Math.max(0, ...q.map((i) => i.id)), items: q.map(({ pending, ...i }) => i) });
}

// Add a reel: { title, caption, hashtags?, video_url, cover_offset_ms?, duration_sec?, slug? }
export async function POST(req: Request) {
  if (!(await allowed(req))) return deny();
  const b = await req.json().catch(() => null);
  if (!b || typeof b.video_url !== "string" || !/^https:\/\//.test(b.video_url) || typeof b.caption !== "string") {
    return Response.json({ error: "need video_url (https) and caption" }, { status: 400 });
  }
  const q = await getQueue();
  if (b.slug && q.some((i) => i.slug === b.slug && i.status !== "skipped")) {
    return Response.json({ error: `slug ${b.slug} is already in the queue` }, { status: 409 });
  }
  const item: Item = {
    id: Math.max(0, ...q.map((i) => i.id)) + 1,
    title: String(b.title || b.slug || "Reel").slice(0, 140),
    caption: igCaption(b.caption, Array.isArray(b.hashtags) ? b.hashtags : []),
    video_url: b.video_url,
    cover_offset_ms: Math.max(0, Math.round(Number(b.cover_offset_ms) || 2500)),
    duration_sec: Number(b.duration_sec) || undefined,
    slug: b.slug ? String(b.slug) : undefined,
    added_at: new Date().toISOString(),
    status: "queued",
  };
  q.push(item);
  await saveQueue(q);
  await log("info", `Added #${item.id} "${item.title}" to the queue`, item.id);
  return Response.json({ ok: true, id: item.id });
}

// Dashboard actions: { id, action: skip | unskip | retry | up | down | post_now | delete | edit, ...fields }
export async function PATCH(req: Request) {
  if (!(await loggedIn())) return deny();
  const b = await req.json().catch(() => ({}));
  const q = await getQueue();
  const i = q.findIndex((x) => x.id === Number(b.id));
  if (i < 0) return Response.json({ error: "not found" }, { status: 404 });
  const it = q[i];
  const busy = it.status === "posting";
  switch (b.action) {
    case "skip": if (!busy && it.status === "queued") it.status = "skipped"; break;
    case "unskip": if (it.status === "skipped") it.status = "queued"; break;
    case "retry": if (it.status === "failed") { it.status = "queued"; it.tries = 0; it.error = undefined; } break;
    case "post_now":
      if (it.status !== "queued") return Response.json({ error: "only queued reels" }, { status: 400 });
      q.forEach((x) => (x.force = false)); it.force = true; break;
    case "up": case "down": {
      const j = b.action === "up" ? i - 1 : i + 1;
      if (j >= 0 && j < q.length) [q[i], q[j]] = [q[j], q[i]];
      break;
    }
    case "edit":
      if (typeof b.caption === "string") it.caption = b.caption.slice(0, 2200);
      if (typeof b.title === "string") it.title = b.title.slice(0, 140);
      if (b.cover_offset_ms != null) it.cover_offset_ms = Math.max(0, Math.round(Number(b.cover_offset_ms) || 0));
      break;
    case "delete":
      if (busy) return Response.json({ error: "reel is being posted right now" }, { status: 400 });
      q.splice(i, 1);
      if (it.status !== "posted" && it.video_url.includes(".blob.vercel-storage.com")) { try { await del(it.video_url); } catch {} }
      break;
    default: return Response.json({ error: "unknown action" }, { status: 400 });
  }
  await saveQueue(q);
  await log("info", `Queue: ${b.action} #${it.id}`, it.id);
  return Response.json({ ok: true });
}
