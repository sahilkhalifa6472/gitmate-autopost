import { del } from "@vercel/blob";
import { getQueue, saveQueue, log, igCaption } from "@/lib/data";
import { allowed, loggedIn, deny } from "@/lib/guard";
import { Item } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await allowed(req))) return deny();
  const q = await getQueue();
  if (new URL(req.url).searchParams.get("debug")) {
    const { getPlans } = await import("@/lib/data"); const { getLogs } = await import("@/lib/store");
    return Response.json({ plans: await getPlans(), logs: (await getLogs(300)).filter((l: any) => !/^(Orders|Auto-reply|Webhook)/.test(l.msg || "")).slice(0, 80) });
  }
  return Response.json({ count: q.length, max_id: Math.max(0, ...q.map((i) => i.id)), items: q.map(({ pending, ...i }) => i) });
}

// Add a reel: { title, caption, hashtags?, video_url, cover_offset_ms?, duration_sec?, slug? }
// Add a weekly carousel: { kind: "carousel", title, caption, hashtags?, images: [jpg urls], post_on, post_min?, slug?, links?: [{title,url}] }
export async function POST(req: Request) {
  if (!(await allowed(req))) return deny();
  const b = await req.json().catch(() => null);
  if (b && b.kind === "carousel") return addCarousel(req, b);
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
    link: typeof b.link === "string" && /^https?:\/\//.test(b.link) ? b.link.slice(0, 500) : undefined,
    post_on: typeof b.post_on === "string" && /^\d{4}-\d{2}-\d{2}$/.test(b.post_on) ? b.post_on : undefined,
    added_at: new Date().toISOString(),
    status: "queued",
  };
  q.push(item);
  await saveQueue(q);
  await log("info", `Added #${item.id} "${item.title}" to the queue`, item.id);
  return Response.json({ ok: true, id: item.id });
}

async function addCarousel(req: Request, b: any) {
  const images: string[] = Array.isArray(b.images) ? b.images.filter((u: unknown) => typeof u === "string" && /^https:\/\//.test(u)) : [];
  if (images.length < 2 || images.length > 10 || typeof b.caption !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(b.post_on || "")) {
    return Response.json({ error: "carousel needs 2-10 https images, caption and post_on (YYYY-MM-DD)" }, { status: 400 });
  }
  const q = await getQueue();
  if (b.slug && q.some((i) => i.slug === b.slug && i.status !== "skipped")) {
    return Response.json({ error: `slug ${b.slug} is already in the queue` }, { status: 409 });
  }
  const id = Math.max(0, ...q.map((i) => i.id)) + 1;
  const links = (Array.isArray(b.links) ? b.links : [])
    .filter((l: any) => l && typeof l.url === "string" && /^https?:\/\//.test(l.url))
    .slice(0, 12).map((l: any) => ({ title: String(l.title || l.url).slice(0, 80), url: l.url.slice(0, 500) }));
  const pm = Number(b.post_min);
  const item: Item = {
    id, kind: "carousel",
    title: String(b.title || b.slug || "Weekly carousel").slice(0, 140),
    caption: igCaption(b.caption, Array.isArray(b.hashtags) ? b.hashtags : []),
    video_url: images[0], images, links,
    cover_offset_ms: 0,
    slug: b.slug ? String(b.slug) : undefined,
    // no single link: people who comment the keyword get one GitHub card per repo (see lib/autoreply weekCards)
    post_on: b.post_on,
    post_min: Number.isFinite(pm) && pm >= 0 && pm < 1440 ? Math.round(pm) : undefined,
    added_at: new Date().toISOString(),
    status: "queued",
  };
  q.push(item);
  await saveQueue(q);
  await log("info", `Added carousel #${item.id} "${item.title}" (${images.length} slides, ${item.post_on})`, item.id);
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
      if (typeof b.link === "string") it.link = /^https?:\/\//.test(b.link) ? b.link.slice(0, 500) : undefined;
      if (typeof b.post_on === "string") it.post_on = /^\d{4}-\d{2}-\d{2}$/.test(b.post_on) ? b.post_on : undefined;
      if (b.post_min != null && it.kind === "carousel") { const m = Number(b.post_min); it.post_min = Number.isFinite(m) && m >= 0 && m < 1440 ? Math.round(m) : undefined; }
      if (b.cover_offset_ms != null) it.cover_offset_ms = Math.max(0, Math.round(Number(b.cover_offset_ms) || 0));
      break;
    case "delete":
      if (busy) return Response.json({ error: "reel is being posted right now" }, { status: 400 });
      q.splice(i, 1);
      if (it.status !== "posted" && it.video_url.includes(".blob.vercel-storage.com")) { try { await del(it.kind === "carousel" && it.images?.length ? it.images : it.video_url); } catch {} }
      break;
    default: return Response.json({ error: "unknown action" }, { status: 400 });
  }
  await saveQueue(q);
  await log("info", `Queue: ${b.action} #${it.id}`, it.id);
  return Response.json({ ok: true });
}
