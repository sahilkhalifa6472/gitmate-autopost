import { tick } from "@/lib/engine";
import { loggedIn, deny } from "@/lib/guard";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST() {
  if (!(await loggedIn())) return deny();
  return Response.json(await tick({ source: "dashboard" }));
}
