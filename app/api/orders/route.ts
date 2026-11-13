import { allowed, deny } from "@/lib/guard";
import { getOrders, saveOrders, getFree, saveFree, getOrderCfg, confirmOrder, importOldRepos, rejectDM, OrderCfg } from "@/lib/orders";
import { set } from "@/lib/store";
import { getQueue, saveQueue, log } from "@/lib/data";

export const dynamic = "force-dynamic";

// Orders page data; the daily reel task reads confirmed orders from here (QUEUE_KEY)
export async function GET(req: Request) {
  if (!(await allowed(req))) return deny();
  const [orders, free, cfg] = await Promise.all([getOrders(), getFree(), getOrderCfg()]);
  return Response.json({ orders, free, cfg });
}

// Actions: confirm {id, date?} · reject {id} · made {id, item_id} · reopen {id} · delete {id}
//          free {repo, status: "featured"|"dismissed"|"new"} · cfg {price?, paypal?, usdc?, per_day?}
//          import (old DM repo links -> free list) · free_made {repo, item_id} (daily task made its reel) · shared {repo}
export async function POST(req: Request) {
  if (!(await allowed(req))) return deny();
  const b = await req.json().catch(() => ({}));
  if (b.action === "confirm") return Response.json(await confirmOrder(String(b.id), b.date));
  if (b.action === "cfg") {
    const c = await getOrderCfg();
    const n: OrderCfg = { ...c,
      price: b.price != null ? Math.max(1, Number(b.price) || c.price) : c.price,
      paypal: typeof b.paypal === "string" ? b.paypal.trim().slice(0, 120) : c.paypal,
      usdc: typeof b.usdc === "string" ? b.usdc.trim().slice(0, 64) : c.usdc,
      per_day: b.per_day != null ? Math.max(1, Math.min(5, Number(b.per_day) || 1)) : c.per_day };
    await set("order_cfg", n); return Response.json({ ok: true, cfg: n });
  }
  if (b.action === "import") return Response.json(await importOldRepos());
  if (b.action === "free_made" || b.action === "shared") {
    const f = await getFree(); const r = f.find((x) => x.repo === b.repo);
    if (!r) return Response.json({ error: "not found" }, { status: 404 });
    if (b.action === "shared") r.shared = true; else { r.status = "featured"; r.item_id = Number(b.item_id) || undefined; }
    await saveFree(f); return Response.json({ ok: true });
  }
  if (b.action === "free") {
    const f = await getFree(); const r = f.find((x) => x.repo === b.repo);
    if (!r) return Response.json({ error: "not found" }, { status: 404 });
    if (["featured", "dismissed", "new"].includes(b.status)) r.status = b.status;
    await saveFree(f); return Response.json({ ok: true });
  }
  const orders = await getOrders(); const i = orders.findIndex((x) => x.id === String(b.id));
  if (i < 0) return Response.json({ error: "not found" }, { status: 404 });
  const o = orders[i];
  switch (b.action) {
    case "reject": o.status = "rejected"; if (b.silent !== true) await rejectDM(o); break;
    case "reopen": o.status = o.repo && o.proof?.length ? "proof" : "asked"; break;
    case "delete": orders.splice(i, 1); break;
    case "made": {
      o.status = "made"; o.item_id = Number(b.item_id) || undefined;
      // the queue item gets the booked date
      if (o.item_id && o.date) { const q = await getQueue(); const it = q.find((x) => x.id === o.item_id); if (it) { it.post_on = o.date; await saveQueue(q); } }
      break;
    }
    default: return Response.json({ error: "unknown action" }, { status: 400 });
  }
  o.updated_at = new Date().toISOString();
  await saveOrders(orders);
  await log("info", `Orders: ${b.action} ${o.repo || o.id}`);
  return Response.json({ ok: true });
}
