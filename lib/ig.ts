// Instagram API with Instagram Login (graph.instagram.com)
const IG = process.env.IG_API_BASE || "https://graph.instagram.com/v23.0";
const IG_ROOT = process.env.IG_API_ROOT || "https://graph.instagram.com";
const FB = "https://graph.facebook.com/v23.0";
// "EAA..." tokens come from Facebook/Unified login and only work on graph.facebook.com
const B = (token: string) => (token.startsWith("EAA") ? FB : IG);
export const replyTokenFor = (c: { reply_token?: string; ig_token?: string }) => c.reply_token || c.ig_token || "";
export async function fbAccount(igUserId: string, token: string) {
  return http(`${FB}/${igUserId}?fields=id,username,followers_count&access_token=${encodeURIComponent(token)}`);
}

async function http(url: string, opts: RequestInit = {}) {
  const res = await fetch(url, { ...opts, cache: "no-store" });
  const text = await res.text();
  let body: any;
  try { body = JSON.parse(text); } catch { body = text; }
  if (!res.ok) {
    const msg = typeof body === "string" ? body : JSON.stringify(body.error || body);
    throw new Error(`${res.status} ${url.split("?")[0].replace(IG, "").replace(FB, "")}: ${msg.slice(0, 400)}`);
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

// ---- comments + messages (needs instagram_business_manage_comments + instagram_business_manage_messages)
const tq = (token: string) => `access_token=${encodeURIComponent(token)}`;
const json = (o: unknown) => ({ method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(o) });

export type IgMedia = { id: string; caption?: string; timestamp: string; permalink?: string; comments_count?: number; media_product_type?: string; thumbnail_url?: string };
export async function listMedia(userId: string, token: string, limit = 25): Promise<IgMedia[]> {
  const b = await http(`${B(token)}/${userId}/media?fields=id,caption,timestamp,permalink,comments_count,media_product_type,thumbnail_url&limit=${limit}&${tq(token)}`);
  return b.data || [];
}

export type IgComment = { id: string; text: string; timestamp: string; username?: string; from?: { id: string; username: string } };
// newest first; stops at pages older than `sinceMs`
export async function listComments(mediaId: string, token: string, sinceMs: number, maxPages = 10): Promise<IgComment[]> {
  const out: IgComment[] = [];
  let url: string | undefined = `${B(token)}/${mediaId}/comments?fields=id,text,timestamp,username,from&limit=50&${tq(token)}`;
  for (let p = 0; url && p < maxPages; p++) {
    const b: any = await http(url);
    const page: IgComment[] = b.data || [];
    out.push(...page);
    if (!page.length || page.every((c) => Date.parse(c.timestamp) < sinceMs)) break;
    url = b.paging?.next;
  }
  return out;
}

export async function replyToComment(commentId: string, token: string, message: string) {
  return http(`${B(token)}/${commentId}/replies`, { method: "POST", body: form({ message, access_token: token }) });
}

// "private reply": a DM to the person who wrote the comment (once per comment, within 7 days)
export async function privateReply(userId: string, token: string, commentId: string, text: string) {
  return http(`${B(token)}/${userId}/messages?${tq(token)}`, json({ recipient: { comment_id: commentId }, message: { text } }));
}

// Same private reply, but the link goes in a button card (Instagram refuses some raw links in text)
export async function privateReplyCard(userId: string, token: string, commentId: string, p: { title: string; subtitle: string; url: string; button: string }) {
  const element = { title: p.title.slice(0, 80), subtitle: p.subtitle.slice(0, 80), buttons: [{ type: "web_url", url: p.url, title: p.button.slice(0, 20) }] };
  return http(`${B(token)}/${userId}/messages?${tq(token)}`, json({ recipient: { comment_id: commentId }, message: { attachment: { type: "template", payload: { template_type: "generic", elements: [element] } } } }));
}

export type QR = { title: string; payload: string };
const qrs = (q: QR[]) => q.map((x) => ({ content_type: "text", title: x.title.slice(0, 20), payload: x.payload }));
export type CardBtn = { title: string; url: string };
const card = (p: { title: string; subtitle?: string; image_url?: string; buttons: CardBtn[] }) => ({
  attachment: { type: "template", payload: { template_type: "generic", elements: [{
    title: p.title.slice(0, 80), ...(p.subtitle ? { subtitle: p.subtitle.slice(0, 80) } : {}), ...(p.image_url ? { image_url: p.image_url } : {}),
    buttons: p.buttons.slice(0, 3).map((b) => ({ type: "web_url", url: b.url, title: b.title.slice(0, 20) })),
  }] } },
});
// private reply (to a comment) with quick-reply buttons; a tap comes back as a normal DM we can read
export async function privateReplyQR(userId: string, token: string, commentId: string, text: string, q: QR[]) {
  return http(`${B(token)}/${userId}/messages?${tq(token)}`, json({ recipient: { comment_id: commentId }, message: { text, quick_replies: qrs(q) } }));
}
export async function sendQR(userId: string, token: string, recipientId: string, text: string, q: QR[]) {
  return http(`${B(token)}/${userId}/messages?${tq(token)}`, json({ recipient: { id: recipientId }, message: { text, quick_replies: qrs(q) } }));
}
export async function sendCard(userId: string, token: string, recipientId: string, p: Parameters<typeof card>[0]) {
  return http(`${B(token)}/${userId}/messages?${tq(token)}`, json({ recipient: { id: recipientId }, message: card(p) }));
}
// does this person (who messaged us) follow the account?
export async function followsUs(igsid: string, token: string): Promise<boolean> {
  const b = await http(`${B(token)}/${igsid}?fields=is_user_follow_business&${tq(token)}`);
  return !!b.is_user_follow_business;
}

export async function userName(igsid: string, token: string): Promise<string | undefined> {
  try { return (await http(`${B(token)}/${igsid}?fields=username&${tq(token)}`)).username; } catch { return undefined; }
}

export async function sendDM(userId: string, token: string, recipientId: string, text: string) {
  return http(`${B(token)}/${userId}/messages?${tq(token)}`, json({ recipient: { id: recipientId }, message: { text } }));
}

export type IgMsg = { id: string; message?: string; created_time: string; from?: { id: string; username?: string }; to?: { data: { id: string; username?: string }[] } };
export type IgConvo = { id: string; updated_time: string; participants?: { data: { id: string; username?: string }[] }; messages?: { data: IgMsg[] } };
export async function conversations(userId: string, token: string, limit = 25): Promise<IgConvo[]> {
  const f = encodeURIComponent("id,updated_time,participants,messages.limit(8){id,message,created_time,from,to}");
  const b = await http(`${B(token)}/${userId}/conversations?platform=instagram&fields=${f}&limit=${limit}&${tq(token)}`);
  return b.data || [];
}

// Every DM thread (paged), with up to `perConvo` latest messages each; used to import old repo links
export async function allConversations(userId: string, token: string, maxPages = 10, perConvo = 40): Promise<IgConvo[]> {
  const f = encodeURIComponent(`id,updated_time,participants,messages.limit(${perConvo}){id,message,created_time,from,to}`);
  let url: string | undefined = `${B(token)}/${userId}/conversations?platform=instagram&fields=${f}&limit=25&${tq(token)}`;
  const out: IgConvo[] = [];
  for (let i = 0; url && i < maxPages; i++) { const b = await http(url); out.push(...(b.data || [])); url = b.paging?.next; }
  return out;
}

export async function mediaThumb(mediaId: string, token: string): Promise<string | undefined> {
  try {
    const b = await http(`${B(token)}/${mediaId}?fields=thumbnail_url,media_url&access_token=${encodeURIComponent(token)}`);
    return b.thumbnail_url || b.media_url;
  } catch { return undefined; }
}
