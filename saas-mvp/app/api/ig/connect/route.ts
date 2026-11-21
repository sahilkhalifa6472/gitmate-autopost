import { cookies } from "next/headers";
import { loggedIn } from "@/lib/guard";
import { authorizeUrl } from "@/lib/ig";
import { appUrl, redirectUri } from "@/lib/env";

export const dynamic = "force-dynamic";

// "Continue with Instagram": send the browser to Instagram's login page
export async function GET(req: Request) {
  if (!(await loggedIn())) return Response.redirect(`${appUrl(req)}/login`);
  const appId = process.env.IG_APP_ID;
  if (!appId || !process.env.IG_APP_SECRET) return Response.redirect(`${appUrl(req)}/?err=${encodeURIComponent("IG_APP_ID / IG_APP_SECRET Vercel me set nahi hai")}`);
  const state = crypto.randomUUID();
  (await cookies()).set("ap_state", state, { httpOnly: true, secure: true, sameSite: "lax", path: "/", maxAge: 600 });
  return Response.redirect(authorizeUrl(appId, redirectUri(req), state));
}
