import { hasCronSecret } from "@/lib/auth";
import { loggedIn } from "@/lib/guard";
import { tick } from "@/lib/engine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

// cron-job.org hits /api/cron?key=CRON_SECRET every 5 minutes (Vercel's own cron is only a daily backup)
async function run(req: Request) {
  if (!hasCronSecret(req) && !(await loggedIn())) return Response.json({ error: "unauthorized" }, { status: 401 });
  return Response.json(await tick());
}
export const GET = run;
export const POST = run;
