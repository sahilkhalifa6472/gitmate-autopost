"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type P = { enabled: boolean; dm_enabled: boolean; keyword: string; dm_text: string; dm_inbox_text: string; public_replies: string[]; default_link: string; max_per_run: number };

export default function ArForm(p: P) {
  const router = useRouter();
  const [f, setF] = useState({ keyword: p.keyword, dm_text: p.dm_text, dm_inbox_text: p.dm_inbox_text, public_replies: p.public_replies.join("\n"), default_link: p.default_link, max_per_run: String(p.max_per_run) });
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  const up = (k: keyof typeof f) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  async function post(body: unknown, ok: string) {
    setBusy(true); setMsg("");
    const r = await fetch("/api/autoreply", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    setMsg(r.ok ? (typeof j.sent === "number" ? `Run: sent ${j.sent}${j.waiting ? `, ${j.waiting} waiting` : ""}` : j.error ? `Error: ${j.error}` : j.note ? `Run: ${j.note}` : ok) : `Error: ${j.error}`);
    router.refresh();
  }
  return (
    <div className="card">
      <h2>Comment → DM auto-reply</h2>
      <div className="row">
        <button className={`btn ${p.enabled ? "pri" : ""}`} disabled={busy} onClick={() => post({ enabled: !p.enabled }, p.enabled ? "Comments auto-reply OFF" : "Comments auto-reply ON")}>{p.enabled ? "Comments: ON" : "Comments: OFF"}</button>
        <button className={`btn ${p.dm_enabled ? "pri" : ""}`} disabled={busy} onClick={() => post({ dm_enabled: !p.dm_enabled }, p.dm_enabled ? "DM auto-reply OFF" : "DM auto-reply ON")}>{p.dm_enabled ? "DM keyword: ON" : "DM keyword: OFF"}</button>
        <button className="btn" disabled={busy} onClick={() => post({ action: "run" }, "Done")}>Run now</button>
      </div>
      <label>Keyword (comment or DM must contain it, any case)</label>
      <input value={f.keyword} onChange={up("keyword")} className="mono" />
      <label>DM to commenters ({"{username}"} {"{link}"} {"{title}"})</label>
      <textarea value={f.dm_text} onChange={up("dm_text")} style={{ minHeight: 110 }} />
      <label>Public replies under the comment (one per line, picked at random)</label>
      <textarea value={f.public_replies} onChange={up("public_replies")} style={{ minHeight: 110 }} />
      <label>Reply when someone DMs the keyword ({"{username}"} {"{links}"} = latest 3 reels)</label>
      <textarea value={f.dm_inbox_text} onChange={up("dm_inbox_text")} style={{ minHeight: 90 }} />
      <label>Default link (used when a post has no link)</label>
      <input value={f.default_link} onChange={up("default_link")} placeholder="https://github.com/…" />
      <label>Max DMs per 5-minute run</label>
      <input value={f.max_per_run} onChange={up("max_per_run")} inputMode="numeric" />
      <div className="row" style={{ marginTop: 14 }}>
        <button className="btn pri" disabled={busy} onClick={() => post({ ...f, max_per_run: Number(f.max_per_run) }, "Saved")}>Save texts</button>
      </div>
      {msg && <div className={`msg ${msg.startsWith("Error") ? "e" : ""}`}>{msg}</div>}
    </div>
  );
}
