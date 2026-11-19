import { allowed, deny } from "@/lib/guard";
import { getSales, saveSales, getPaused, getNeeds, saveNeeds, getSalesLog, hasKey, keyHint, testKey } from "@/lib/salesai";
import { set } from "@/lib/store";
import { getConfig } from "@/lib/data";
import * as ig from "@/lib/ig";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await allowed(req))) return deny();
  // ?chat=<igsid>: that person's latest DMs (to check what the AI and the fixed flows sent)
  const chat = new URL(req.url).searchParams.get("chat");
  if (chat) {
    const c = await getConfig();
    const msgs = await ig.convoWith(c.ig_user_id!, ig.replyTokenFor(c), chat, 40).catch((e) => ({ error: e.message }));
    return Response.json(Array.isArray(msgs) ? msgs.slice().reverse().map((m) => ({ at: m.created_time, from: m.from?.id === chat ? "them" : "us", text: m.message || "[attachment]" })) : msgs);
  }
  const [cfg, paused, needs, logs] = await Promise.all([getSales(), getPaused(), getNeeds(), getSalesLog(60)]);
  return Response.json({ key: await hasKey(), key_hint: await keyHint(), cfg, paused, needs, logs });
}

// Actions: key {key} (Gemini key, tested first; empty removes) · cfg {enabled?, followup?, discount?, notes?} · pause {igsid} · resume {igsid} · done {igsid} (clear "needs you")
export async function POST(req: Request) {
  if (!(await allowed(req))) return deny();
  const b = await req.json().catch(() => ({}));
  if (b.action === "cfg") {
    const c = await getSales();
    if (typeof b.enabled === "boolean") c.enabled = b.enabled;
    if (typeof b.followup === "boolean") c.followup = b.followup;
    if (b.discount != null) c.discount = Math.max(0, Number(b.discount) || 0);
    if (typeof b.notes === "string") c.notes = b.notes.slice(0, 2000);
    await saveSales(c); return Response.json({ ok: true, cfg: c });
  }
  if (b.action === "key") {
    const k = String(b.key || "").trim();
    if (!k) { await set("sales_key", ""); return Response.json({ ok: true, removed: true }); }
    const t = await testKey(k);
    if (!t.ok) return Response.json({ error: "Key not working: " + t.error }, { status: 400 });
    await set("sales_key", k); return Response.json({ ok: true });
  }
  const id = String(b.igsid || "");
  if (!id) return Response.json({ error: "igsid needed" }, { status: 400 });
  if (b.action === "pause" || b.action === "resume") {
    const p = (await getPaused()).filter((x) => x !== id);
    if (b.action === "pause") p.push(id);
    await set("sales_paused", p); return Response.json({ ok: true });
  }
  if (b.action === "done") { const n = await getNeeds(); delete n[id]; await saveNeeds(n); return Response.json({ ok: true }); }
  return Response.json({ error: "unknown action" }, { status: 400 });
}
