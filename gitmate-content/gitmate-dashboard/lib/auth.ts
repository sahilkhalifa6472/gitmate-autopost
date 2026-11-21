// Dashboard login: cookie holds sha256(password + fixed salt). Works in middleware (Web Crypto).
export const COOKIE = "gm_session";

export async function sessionValue(): Promise<string> {
  const pw = process.env.DASHBOARD_PASSWORD || "";
  const data = new TextEncoder().encode(`gitmate-dashboard:${pw}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function isLoggedIn(cookieValue: string | undefined) {
  if (!process.env.DASHBOARD_PASSWORD || !cookieValue) return false;
  return cookieValue === (await sessionValue());
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}

// The daily reel task sends QUEUE_KEY in x-upload-token (own key, separate from the Growaun server)
export function hasUploadToken(given: string | null | undefined) {
  const want = process.env.QUEUE_KEY || "";
  return want.length >= 16 && !!given && safeEqual(given, want);
}

export function hasCronSecret(req: Request) {
  const want = process.env.CRON_SECRET || "";
  if (want.length < 8) return false;
  const u = new URL(req.url);
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  return safeEqual(u.searchParams.get("key") || "", want) || safeEqual(bearer || "", want);
}
