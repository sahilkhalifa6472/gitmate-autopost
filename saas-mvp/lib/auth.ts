// One-person login: cookie = sha256(APP_PASSWORD + salt). Works in middleware (Web Crypto).
export const COOKIE = "ap_session";

export async function sessionValue(): Promise<string> {
  const data = new TextEncoder().encode(`ig-autopilot:${process.env.APP_PASSWORD || ""}`);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, "0")).join("");
}
export async function isLoggedIn(v: string | undefined) {
  return !!process.env.APP_PASSWORD && !!v && v === (await sessionValue());
}
export function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let r = 0;
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return r === 0;
}
export function hasCronSecret(req: Request) {
  const want = process.env.CRON_SECRET || "";
  if (want.length < 8) return false;
  const bearer = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "") || "";
  return safeEqual(new URL(req.url).searchParams.get("key") || "", want) || safeEqual(bearer, want);
}
