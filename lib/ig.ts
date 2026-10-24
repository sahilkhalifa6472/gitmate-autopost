// Instagram API with Instagram Login (graph.instagram.com)
const IG = process.env.IG_API_BASE || "https://graph.instagram.com/v23.0";
const IG_ROOT = process.env.IG_API_ROOT || "https://graph.instagram.com";

async function http(url: string, opts: RequestInit = {}) {
  const res = await fetch(url, { ...opts, cache: "no-store" });
  const text = await res.text();
  let body: any;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) {
    const msg = typeof body === "string" ? body : JSON.stringify(body.error || body);
    throw new Error(`${res.status} ${url.split("?")[0].replace(IG, "")}: ${msg.slice(0, 400)}`);
  }
  return body;
}
const form = (o: Record<string, unknown>) =>
  new URLSearchParams(Object.entries(o).filter(([, v]) => v != null && v !== "").map(([k, v]) => [k, String(v)]));

export async function me(token: string) {
  return http(`${IG}/me?fields=user_id,username,account_type,followers_count,media_count&access_token=${encodeURIComponent(token)}`);
}

export async function refreshToken(token: string): Promise<string> {
  const b = await http(`${IG_ROOT}/refresh_access_token?grant_type=ig_refresh_token&access_token=${encodeURIComponent(token)}`);
  return b.access_token;
}

export async function createReel(userId: string, token: string, p: { video_url: string; caption: string; thumb_offset: number }) {
  return http(`${IG}/${userId}/media`, {
    method: "POST",
    body: form({ media_type: "REELS", video_url: p.video_url, caption: p.caption, share_to_feed: "true", thumb_offset: p.thumb_offset, access_token: token }),
  }) as Promise<{ id: string }>;
}

export async function containerStatus(id: string, token: string) {
  return http(`${IG}/${id}?fields=status_code,status&access_token=${encodeURIComponent(token)}`) as Promise<{ status_code: string; status?: string }>;
}

export async function publish(userId: string, token: string, creationId: string) {
  return http(`${IG}/${userId}/media_publish`, { method: "POST", body: form({ creation_id: creationId, access_token: token }) }) as Promise<{ id: string }>;
}

export async function permalink(mediaId: string, token: string): Promise<string> {
  try { return (await http(`${IG}/${mediaId}?fields=permalink&access_token=${encodeURIComponent(token)}`)).permalink || ""; } catch { return ""; }
}

export async function insights(mediaId: string, token: string) {
  const t = encodeURIComponent(token);
  const full = "views,reach,likes,comments,shares,saved,total_interactions,ig_reels_avg_watch_time,ig_reels_video_view_total_time";
  let body: any;
  try { body = await http(`${IG}/${mediaId}/insights?metric=${full}&access_token=${t}`); }
  catch { body = await http(`${IG}/${mediaId}/insights?metric=views,reach,likes,comments,shares,saved,total_interactions&access_token=${t}`); }
  const out: Record<string, number> = {};
  for (const m of body.data || []) out[m.name] = m.values?.[0]?.value ?? 0;
  return out;
}
