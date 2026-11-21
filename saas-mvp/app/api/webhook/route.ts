// Meta app -> Instagram -> Webhooks. Callback: https://<site>/api/webhook, verify token = WEBHOOK_VERIFY_TOKEN
import crypto from "crypto";
import { after } from "next/server";
import { handleWebhook } from "@/lib/engine";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function GET(req: Request) {
  const u = new URL(req.url).searchParams;
  const want = process.env.WEBHOOK_VERIFY_TOKEN;
  if (u.get("hub.mode") === "subscribe" && want && u.get("hub.verify_token") === want) return new Response(u.get("hub.challenge") || "", { status: 200 });
  return new Response("forbidden", { status: 403 });
}

export async function POST(req: Request) {
  const raw = await req.text();
  const secret = process.env.IG_APP_SECRET;
  if (secret) {
    const sig = req.headers.get("x-hub-signature-256") || "";
    const want = "sha256=" + crypto.createHmac("sha256", secret).update(raw).digest("hex");
    if (sig.length !== want.length || !crypto.timingSafeEqual(Buffer.from(sig), Buffer.from(want))) return new Response("bad signature", { status: 401 });
  }
  let body: any;
  try { body = JSON.parse(raw); } catch { return new Response("bad json", { status: 400 }); }
  after(() => handleWebhook(body).catch(() => {})); // answer Meta at once, work right after
  return Response.json({ ok: true });
}
