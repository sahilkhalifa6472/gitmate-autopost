"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Set the link that commenters of this post get in their DM
export default function LinkInput({ mediaId, value, fallback }: { mediaId: string; value: string; fallback: string }) {
  const router = useRouter();
  const [v, setV] = useState(value);
  const [st, setSt] = useState("");
  return (
    <div className="row" style={{ flexWrap: "nowrap" }}>
      <input value={v} onChange={(e) => setV(e.target.value)} placeholder={fallback || "https://github.com/…"} style={{ minWidth: 220 }} />
      <button className="btn sm" onClick={async () => {
        setSt("…");
        const r = await fetch("/api/autoreply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ media_id: mediaId, link: v }) });
        setSt(r.ok ? "✓" : "error"); router.refresh();
      }}>Save</button>
      {st && <span className="msg" style={{ marginTop: 0 }}>{st}</span>}
    </div>
  );
}
