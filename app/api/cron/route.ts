import { tick } from "@/lib/engine";
import { runAutoReply } from "@/lib/autoreply";
import { hasCronSecret } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Called every 5 min by cron-job.org (…/api/cron?key=CRON_SECRET) and once a day by Vercel Cron.
export async function GET(req: Request) {
  if (!hasCronSecret(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  const post = await tick({ source: "cron" });
  const autoreply = await runAutoReply().catch((e) => ({ ok: false, error: String(e?.message || e) }));
  return Response.json({ ...post, autoreply });
}
