"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type Props = { username?: string; timezone: string; windows: string; posts: number; paused: boolean };

export default function SettingsForm(p: Props) {
  const router = useRouter();
  const [token, setToken] = useState("");
  const [tz, setTz] = useState(p.timezone);
  const [win, setWin] = useState(p.windows);
  const [posts, setPosts] = useState(String(p.posts));
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function save(body: unknown, ok: string) {
    setBusy(true); setMsg("");
    const r = await fetch("/api/settings", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    setBusy(false);
    setMsg(r.ok ? ok + (j.username ? ` (@${j.username})` : "") : `Error: ${j.error}`);
    if (r.ok) { setToken(""); router.refresh(); }
  }

  return (
    <div className="grid g2">
      <div className="card">
        <h2>Instagram account</h2>
        <div className="row">{p.username ? <span className="pill"><span className="dot on" />@{p.username} connected</span> : <span className="pill err">not connected</span>}</div>
        <label>Paste a new access token (from Meta developer app → Instagram → Generate token)</label>
        <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="IGAA…" autoComplete="off" />
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn pri" disabled={busy || !token} onClick={() => save({ token }, "Connected")}>Connect</button>
          {p.username && <button className="btn" disabled={busy} onClick={() => window.confirm("Disconnect Instagram?") && save({ disconnect: true }, "Disconnected")}>Disconnect</button>}
        </div>
        <div className="msg">The token is stored only in your Vercel database, never shown again, and refreshed automatically every week (valid 60 days).</div>
      </div>
      <div className="card">
        <h2>Schedule</h2>
        <label>Audience timezone</label>
        <input value={tz} onChange={(e) => setTz(e.target.value)} />
        <label>Posting windows (hours in that timezone)</label>
        <input value={win} onChange={(e) => setWin(e.target.value)} className="mono" />
        <label>Posts per day</label>
        <input value={posts} onChange={(e) => setPosts(e.target.value)} inputMode="numeric" />
        <div className="row" style={{ marginTop: 14 }}>
          <button className="btn pri" disabled={busy} onClick={() => save({ timezone: tz, windows: win, posts_per_day: Number(posts) }, "Saved. New values apply from the next day's plan")}>Save</button>
          <button className="btn" disabled={busy} onClick={() => save({ paused: !p.paused }, p.paused ? "Resumed" : "Paused")}>{p.paused ? "Resume posting" : "Pause posting"}</button>
          <button className="btn" disabled={busy} onClick={async () => { setBusy(true); const r = await fetch("/api/run", { method: "POST" }); const j = await r.json(); setBusy(false); setMsg(`Run: ${j.note || (j.ok ? "done" : j.error)}`); router.refresh(); }}>Run now</button>
        </div>
      </div>
      {msg && <div className={`msg ${msg.startsWith("Error") ? "e" : ""}`}>{msg}</div>}
    </div>
  );
}
