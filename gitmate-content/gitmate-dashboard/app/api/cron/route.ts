import { tick } from "@/lib/engine";
import { hasCronSecret } from "@/lib/auth";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// Called every 5 min by cron-job.org (…/api/cron?key=CRON_SECRET) and once a day by Vercel Cron.
export async function GET(req: Request) {
  if (!hasCronSecret(req)) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json(await tick({ source: "cron" }));
}
