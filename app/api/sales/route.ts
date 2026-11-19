import { allowed, deny } from "@/lib/guard";
import { getSales, saveSales, getPaused, getNeeds, saveNeeds, getSalesLog, hasKey } from "@/lib/salesai";
import { set } from "@/lib/store";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  if (!(await allowed(req))) return deny();
  const [cfg, paused, needs, logs] = await Promise.all([getSales(), getPaused(), getNeeds(), getSalesLog(60)]);
  return Response.json({ key: hasKey(), cfg, paused, needs, logs });
}

// Actions: cfg {enabled?, followup?, discount?, notes?} · pause {igsid} · resume {igsid} · done {igsid} (clear "needs you")
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
