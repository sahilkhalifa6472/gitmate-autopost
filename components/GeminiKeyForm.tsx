"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Paste the Gemini API key (checked with Google before it's saved)
export default function GeminiKeyForm({ hint }: { hint: string }) {
  const router = useRouter();
  const [k, setK] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginTop: 10 }} onSubmit={async (e) => {
      e.preventDefault(); if (!k.trim()) return; setBusy(true); setMsg("");
      const r = await fetch("/api/sales", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ action: "key", key: k.trim() }) });
      const j = await r.json().catch(() => ({}));
      setMsg(r.ok ? "✓ Key works, saved" : j.error || "Failed"); setBusy(false); if (r.ok) setK(""); router.refresh();
    }}>
      <input type="password" autoComplete="off" placeholder={hint ? `Gemini key saved (${hint}) · paste a new one to change` : "Paste Gemini API key (AIza…)"} value={k} onChange={(e) => setK(e.target.value)} style={{ flex: "1 1 260px" }} />
      <button className="btn pri sm" disabled={busy}>{busy ? "Checking…" : "Save key"}</button>
      {msg && <span className={`msg ${msg.startsWith("✓") ? "" : "e"}`}>{msg}</span>}
    </form>
  );
}
