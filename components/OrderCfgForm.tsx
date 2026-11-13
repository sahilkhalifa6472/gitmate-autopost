"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OrderCfgForm({ price, paypal, usdc, per_day }: { price: number; paypal: string; usdc: string; per_day: number }) {
  const router = useRouter();
  const [v, setV] = useState({ price, paypal, usdc, per_day });
  const [msg, setMsg] = useState("");
  return (
    <form className="grid" style={{ gap: 10 }} onSubmit={async (e) => {
      e.preventDefault(); setMsg("");
      const r = await fetch("/api/orders", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "cfg", ...v }) });
      setMsg(r.ok ? "Saved" : "Failed"); router.refresh();
    }}>
      <label className="sub" style={{ margin: 0 }}>Price ($)<input type="number" value={v.price} onChange={(e) => setV({ ...v, price: +e.target.value })} /></label>
      <label className="sub" style={{ margin: 0 }}>PayPal email<input value={v.paypal} onChange={(e) => setV({ ...v, paypal: e.target.value })} /></label>
      <label className="sub" style={{ margin: 0 }}>USDC wallet (Solana)<input value={v.usdc} onChange={(e) => setV({ ...v, usdc: e.target.value })} /></label>
      <label className="sub" style={{ margin: 0 }}>Paid reels per day<input type="number" value={v.per_day} onChange={(e) => setV({ ...v, per_day: +e.target.value })} /></label>
      <div><button className="btn pri sm">Save</button> {msg && <span className="msg">{msg}</span>}</div>
    </form>
  );
}
