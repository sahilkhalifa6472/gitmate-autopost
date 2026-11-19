// Instagram webhooks (Meta app → Instagram API → Configure webhooks).
// Callback URL: https://<site>/api/webhook   Verify token: shown on the Inbox page / set via PUT /api/autoreply
import crypto from "crypto";
import { after } from "next/server";
import { getAr, handleWebhook } from "@/lib/autoreply";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const ar = await getAr();
  const want = process.env.WEBHOOK_VERIFY_TOKEN || ar.webhook_token;
  if (u.get("hub.mode") === "subscribe" && want && u.get("hub.verify_token") === want) return new Response(u.get("hub.challenge") || "", { status: 200 });
  return new Response("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  // with META_APP_SECRET set, only Meta-signed calls are accepted
  const secret = process.env.META_APP_SECRET;
  if (secret) {
    const sig = req.headers.get("x-hub-signature-256") || "";
    const want = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return new Response("bad signature", { status: 401 });
  }
  let body: any;
  try { body = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }
  // answer Meta right away (slow AI replies made Meta re-send the event), do the work just after
  after(() => handleWebhook(body).catch(() => {}));
  return Response.json({ ok: true }); // always 200 so Meta doesn't disable the subscription
}
