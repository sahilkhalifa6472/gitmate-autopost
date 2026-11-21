import { cookies } from "next/headers";
import { loggedIn } from "@/lib/guard";
import * as ig from "@/lib/ig";
import { account, saveAccount, log, DEFAULT_BRAIN } from "@/lib/data";
import { appUrl, redirectUri } from "@/lib/env";

export const dynamic = "force-dynamic";

// Instagram sends the user back here with ?code=...: swap it for a 60-day token and save the account
export async function GET(req: Request) {
  const home = appUrl(req);
  const back = (q: string) => Response.redirect(`${home}/?${q}`);
  if (!(await loggedIn())) return Response.redirect(`${home}/login`);
  const u = new URL(req.url).searchParams;
  const jar = await cookies();
  const state = jar.get("ap_state")?.value;
  jar.delete("ap_state");
  if (u.get("error")) return back(`err=${encodeURIComponent(u.get("error_description") || u.get("error") || "cancelled")}`);
  if (!u.get("code") || !state || u.get("state") !== state) return back(`err=${encodeURIComponent("Login expire ho gaya, dobara try karo")}`);
  try {
    const token = await ig.exchangeCode(process.env.IG_APP_ID!, process.env.IG_APP_SECRET!, redirectUri(req), u.get("code")!);
    const prof = await ig.me(token);
    const id = String(prof.user_id);
    const old = await account(id);
    await saveAccount({
      id, username: prof.username, token, token_at: Date.now(), connected_at: old?.connected_at || Date.now(),
      reply_token: old?.reply_token, rules: old?.rules || [], ai_on: old?.ai_on || false,
      brain: old?.brain || DEFAULT_BRAIN, goal: old?.goal || "", tone: old?.tone || "", last_error: "",
    });
    let note = "";
    try { await ig.subscribe(id, token); } catch (e: any) { note = ` (webhook subscribe failed: ${e.message.slice(0, 120)})`; }
    await log(id, "token", `Connected @${prof.username}${note}`, !note);
    return back(`ok=${encodeURIComponent("@" + prof.username + " connected")}`);
  } catch (e: any) {
    return back(`err=${encodeURIComponent(e.message.slice(0, 300))}`);
  }
}
