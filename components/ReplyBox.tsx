"use client";
import { useState } from "react";

export default function ReplyBox({ recipientId, username }: { recipientId: string; username: string }) {
  const [t, setT] = useState("");
  const [st, setSt] = useState("");
  return (
    <div className="row" style={{ marginTop: 8, flexWrap: "nowrap" }}>
      <input value={t} onChange={(e) => setT(e.target.value)} placeholder={`Reply to @${username}…`} />
      <button className="btn sm pri" disabled={!t.trim() || st === "…"} onClick={async () => {
        setSt("…");
        const r = await fetch("/api/inbox", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ recipient_id: recipientId, username, text: t }) });
        const j = await r.json().catch(() => ({}));
        if (r.ok) { setT(""); setSt("sent ✓"); } else setSt(`error: ${j.error || "failed"}`);
      }}>Send</button>
      {st && <span className={`msg ${st.startsWith("error") ? "e" : ""}`} style={{ marginTop: 0 }}>{st}</span>}
    </div>
  );
}
