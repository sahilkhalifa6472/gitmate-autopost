"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// AI salesman settings: discount it may offer, extra instructions
export default function SalesForm({ discount, notes }: { discount: number; notes: string }) {
  const router = useRouter();
  const [v, setV] = useState({ discount, notes });
  const [msg, setMsg] = useState("");
  return (
    <form className="grid" style={{ gap: 10, marginTop: 10 }} onSubmit={async (e) => {
      e.preventDefault(); setMsg("");
      const r = await fetch("/api/sales", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "cfg", ...v }) });
      setMsg(r.ok ? "Saved" : "Failed"); router.refresh();
    }}>
      <label className="sub" style={{ margin: 0 }}>Discount price AI may offer once if they hesitate ($, 0 = never)<input type="number" value={v.discount} onChange={(e) => setV({ ...v, discount: +e.target.value })} /></label>
      <label className="sub" style={{ margin: 0 }}>Extra instructions for the AI (optional)<textarea rows={3} value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} placeholder="e.g. This week reels go out within 3 days" /></label>
      <div><button className="btn pri sm">Save</button> {msg && <span className="msg">{msg}</span>}</div>
    </form>
  );
}
