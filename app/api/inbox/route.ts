import * as ig from "@/lib/ig";
import { getConfig, log } from "@/lib/data";
import { loggedIn, deny } from "@/lib/guard";

export const dynamic = "force-dynamic";

// Reply to a DM from the dashboard (Instagram allows this within 24h of their last message)
export async function POST(req: Request) {
  if (!(await loggedIn())) return deny();
  const b = await req.json().catch(() => ({}));
  const cfg = await getConfig();
  if (!cfg.ig_token || !cfg.ig_user_id) return Response.json({ error: "Instagram not connected" }, { status: 400 });
  const text = String(b.text || "").trim().slice(0, 1000);
  if (!b.recipient_id || !text) return Response.json({ error: "need recipient and text" }, { status: 400 });
  try {
    await ig.sendDM(cfg.ig_user_id, cfg.ig_token, String(b.recipient_id), text);
    await log("ok", `DM sent to @${b.username || b.recipient_id}`);
    return Response.json({ ok: true });
  } catch (e: any) {
    return Response.json({ error: e.message.slice(0, 300) }, { status: 400 });
  }
}
