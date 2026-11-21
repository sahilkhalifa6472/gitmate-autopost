import { cookies } from "next/headers";
import { COOKIE, sessionValue } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({ password: "" }));
  const want = process.env.DASHBOARD_PASSWORD || "";
  if (!want) return Response.json({ error: "DASHBOARD_PASSWORD is not set in Vercel" }, { status: 500 });
  if (password !== want) {
    await new Promise((r) => setTimeout(r, 800));
    return Response.json({ error: "Wrong password" }, { status: 401 });
  }
  (await cookies()).set(COOKIE, await sessionValue(), { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
  return Response.json({ ok: true });
}
