"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Small button that calls an API and refreshes the page
export default function Act({ url, method = "POST", body, label, cls = "btn sm", confirm: ask }: { url: string; method?: string; body?: unknown; label: string; cls?: string; confirm?: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");
  return (
    <>
      <button className={cls} disabled={busy} onClick={async () => {
        if (ask && !window.confirm(ask)) return;
        setBusy(true); setErr("");
        const r = await fetch(url, { method, headers: { "content-type": "application/json" }, body: body ? JSON.stringify(body) : undefined });
        const j = await r.json().catch(() => ({}));
        if (!r.ok) setErr(j.error || "failed");
        setBusy(false); router.refresh();
      }}>{busy ? "…" : label}</button>
      {err && <span className="msg e">{err}</span>}
    </>
  );
}
