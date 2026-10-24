import * as ig from "@/lib/ig";
import { getConfig, saveConfig, log } from "@/lib/data";
import { loggedIn, deny } from "@/lib/guard";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  if (!(await loggedIn())) return deny();
  const b = await req.json().catch(() => ({}));
  const cfg = await getConfig();

  if (typeof b.token === "string" && b.token.trim()) {
    const tok = b.token.trim();
    try {
      const m = await ig.me(tok);
      cfg.ig_token = tok;
      cfg.ig_user_id = String(m.user_id || m.id);
      cfg.username = m.username;
      cfg.account_type = m.account_type;
      cfg.token_refreshed_at = Date.now();
      await log("ok", `Instagram connected: @${m.username} (${m.account_type})`);
    } catch (e: any) {
      return Response.json({ error: `Token did not work: ${e.message}` }, { status: 400 });
    }
  }
  if (b.disconnect) {
    cfg.ig_token = undefined; cfg.ig_user_id = undefined; cfg.username = undefined;
    await log("warn", "Instagram account disconnected");
  }
  if (typeof b.timezone === "string" && b.timezone) {
    try { new Intl.DateTimeFormat("en", { timeZone: b.timezone }); cfg.timezone = b.timezone; }
    catch { return Response.json({ error: "Unknown timezone" }, { status: 400 }); }
  }
  if (typeof b.windows === "string") {
    const w = b.windows.split(",").map((x: string) => x.trim().split("-").map(Number))
      .filter((x: number[]) => x.length === 2 && x[0] >= 0 && x[1] <= 24 && x[0] < x[1]) as [number, number][];
    if (!w.length) return Response.json({ error: "Windows look wrong, use e.g. 7-9,9-11" }, { status: 400 });
    cfg.windows = w;
  }
  if (b.posts_per_day != null) cfg.posts_per_day = Math.max(0, Math.min(5, Number(b.posts_per_day) || 0));
  if (typeof b.paused === "boolean") { cfg.paused = b.paused; await log("info", b.paused ? "Auto-posting paused" : "Auto-posting resumed"); }
  await saveConfig(cfg);
  return Response.json({ ok: true, username: cfg.username });
}
