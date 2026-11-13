import Nav from "@/components/Nav";
import Act from "@/components/Act";
import OrderCfgForm from "@/components/OrderCfgForm";
import { getOrders, getFree, getOrderCfg, niceDate, Order } from "@/lib/orders";

export const dynamic = "force-dynamic";
const fmt = (s: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(s));
const LABEL: Record<Order["status"], string> = { asked: "waiting for repo / payment", proof: "check payment", confirmed: "booked · reel to make", made: "reel in queue", live: "posted", rejected: "rejected" };

function OrderCard({ o }: { o: Order }) {
  return (
    <div className="prow">
      <div className="hd"><div className="ttl">@{o.user || o.igsid}</div><span className={`pill ${o.status === "proof" ? "solid" : ""}`}>{LABEL[o.status]}</span></div>
      <small>{fmt(o.created_at)} IST{o.date ? <> · 📅 {niceDate(o.date)}</> : null}{o.item_id ? <> · queue #{o.item_id}</> : null}</small>
      {o.repo ? <div style={{ marginTop: 6 }}><a href={o.repo} target="_blank">{o.repo.replace("https://github.com/", "")}</a></div> : <div className="sub" style={{ margin: "6px 0 0" }}>no repo link yet</div>}
      {(o.proof || []).map((p, k) => p.kind === "image"
        ? <a key={k} href={p.url} target="_blank"><img src={p.url} alt="payment proof" style={{ marginTop: 8, maxWidth: 220, maxHeight: 300, borderRadius: 12, border: "1px solid var(--line2)" }} /></a>
        : <div key={k} style={{ marginTop: 6 }}><a href={p.url} target="_blank">Solana tx</a> <span className={`pill ${p.verified ? "solid" : "err"}`}>{p.verified ? "✓ verified" : "not verified"}</span> <small>{p.note}</small></div>)}
      {(o.notes || []).map((n, k) => <div key={k} className="msg e">{n}</div>)}
      <div className="row" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 10 }}>
        {(o.status === "proof" || o.status === "asked") && <Act url="/api/orders" body={{ action: "confirm", id: o.id }} label="✅ Confirm payment" cls="btn pri sm" confirm={`Confirm payment from @${o.user || o.igsid}? They get the next free date by DM.`} />}
        {(o.status === "proof" || o.status === "asked") && <Act url="/api/orders" body={{ action: "reject", id: o.id }} label="Reject" />}
        {o.status === "rejected" && <Act url="/api/orders" body={{ action: "reopen", id: o.id }} label="Reopen" />}
        {o.status !== "made" && o.status !== "confirmed" && <Act url="/api/orders" body={{ action: "delete", id: o.id }} label="Delete" confirm="Delete this order?" />}
      </div>
    </div>
  );
}

export default async function OrdersPage() {
  const [orders, free, cfg] = await Promise.all([getOrders(), getFree(), getOrderCfg()]);
  const todo = orders.filter((o) => o.status === "proof"), open = orders.filter((o) => o.status === "asked"),
    booked = orders.filter((o) => o.status === "confirmed" || o.status === "made"), done = orders.filter((o) => o.status === "live" || o.status === "rejected");
  const fresh = free.filter((f) => f.status === "new");
  return (
    <>
      <Nav />
      <div className="wrap">
        <div className="ph"><h1>Orders</h1><span className="pill solid">{todo.length} to confirm</span></div>
        <div className="sub">People who DM "FEATURE" get the offer automatically. When they send their repo + payment proof it shows up here. Press Confirm and they get the next free date by DM. Repo links sent without FEATURE go to Free repos.</div>
        {!cfg.paypal && !cfg.usdc && <div className="warnbox">Add your PayPal / USDC below so the offer DM has payment details.</div>}
        <div className="grid g2" style={{ marginTop: 16 }}>
          <div className="grid" style={{ alignContent: "start" }}>
            <div className="card"><h2>Check payment <small>repo + proof received</small></h2>
              {todo.length ? <div className="plist">{todo.map((o) => <OrderCard key={o.id} o={o} />)}</div> : <div className="empty">Nothing to confirm.</div>}</div>
            <div className="card"><h2>Booked <small>reels to make / in queue</small></h2>
              {booked.length ? <div className="plist">{booked.sort((a, b) => (a.date || "").localeCompare(b.date || "")).map((o) => <OrderCard key={o.id} o={o} />)}</div> : <div className="empty">No booked reels.</div>}</div>
            <div className="card"><h2>Waiting <small>got the offer, no repo/payment yet</small></h2>
              {open.length ? <div className="plist">{open.map((o) => <OrderCard key={o.id} o={o} />)}</div> : <div className="empty">Nobody waiting.</div>}</div>
          </div>
          <div className="grid" style={{ alignContent: "start" }}>
            <div className="card"><h2>Free repos <small>{fresh.length} new · sent by DM</small></h2>
              {fresh.length ? <div className="plist">{fresh.slice(0, 100).map((f) => (
                <div className="prow" key={f.repo}>
                  <div className="hd"><div className="ttl"><a href={f.repo} target="_blank">{f.repo.replace("https://github.com/", "")}</a></div></div>
                  <small>@{f.user || f.igsid} · {fmt(f.at)} IST</small>
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <Act url="/api/orders" body={{ action: "free", repo: f.repo, status: "featured" }} label="⭐ Make a reel" />
                    <Act url="/api/orders" body={{ action: "free", repo: f.repo, status: "dismissed" }} label="Skip" />
                  </div>
                </div>))}</div> : <div className="empty">No new repos.</div>}
              {free.some((f) => f.status === "featured") && <div className="sub" style={{ marginTop: 12 }}>⭐ picked for a reel: {free.filter((f) => f.status === "featured").map((f) => f.repo.replace("https://github.com/", "")).join(", ")}</div>}
            </div>
            <div className="card"><h2>Offer settings</h2><OrderCfgForm price={cfg.price} paypal={cfg.paypal} usdc={cfg.usdc} per_day={cfg.per_day} /></div>
            {done.length > 0 && <div className="card"><h2>Done</h2><div className="plist">{done.slice(0, 30).map((o) => <OrderCard key={o.id} o={o} />)}</div></div>}
          </div>
        </div>
      </div>
    </>
  );
}
