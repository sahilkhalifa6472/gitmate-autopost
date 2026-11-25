"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";

type P = { enabled: boolean; dm_enabled: boolean; keyword: string; dm_text: string; dm_inbox_text: string; public_replies: string[]; default_link: string; max_per_run: number; reply_all: boolean; link_in_comment: boolean; pin_comment: boolean; link_replies: string[]; pin_text: string };

export default function ArForm(p: P) {
  const router = useRouter();
  const [f, setF] = useState({ keyword: p.keyword, dm_text: p.dm_text, dm_inbox_text: p.dm_inbox_text, public_replies: p.public_replies.join("\n"), default_link: p.default_link, max_per_run: String(p.max_per_run), link_replies: p.link_replies.join("\n"), pin_text: p.pin_text });
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
      <div className="tog">
        <button className={`btn ${p.enabled ? "pri" : ""}`} disabled={busy} onClick={() => post({ enabled: !p.enabled }, p.enabled ? "Comments auto-reply OFF" : "Comments auto-reply ON")}>{p.enabled ? "Comments: ON" : "Comments: OFF"}</button>
        <button className={`btn ${p.dm_enabled ? "pri" : ""}`} disabled={busy} onClick={() => post({ dm_enabled: !p.dm_enabled }, p.dm_enabled ? "DM auto-reply OFF" : "DM auto-reply ON")}>{p.dm_enabled ? "DM keyword: ON" : "DM keyword: OFF"}</button>
        <button className="btn" disabled={busy} onClick={() => post({ action: "run" }, "Done")}>Run now</button>
      </div>
      <div className="tog">
        <button className={`btn ${p.reply_all ? "pri" : ""}`} disabled={busy} onClick={() => post({ reply_all: !p.reply_all }, "Saved")}>{p.reply_all ? "Every comment: ON" : "Every comment: OFF"}</button>
        <button className={`btn ${p.link_in_comment ? "pri" : ""}`} disabled={busy} onClick={() => post({ link_in_comment: !p.link_in_comment }, "Saved")}>{p.link_in_comment ? "Link in comment reply: ON" : "Link in comment reply: OFF"}</button>
        <button className={`btn ${p.pin_comment ? "pri" : ""}`} disabled={busy} onClick={() => post({ pin_comment: !p.pin_comment }, "Saved")}>{p.pin_comment ? "Link comment on posts: ON" : "Link comment on posts: OFF"}</button>
      </div>
      <div className="msg">Every comment = answer all comments, not only the keyword. Link in comment reply = the repo link goes in the public reply and no DM is sent (use while DMs are blocked). Link comment on posts = one link comment on each recent post; pin it in the Instagram app.</div>
      <label>Keyword (comment or DM must contain it, any case)</label>
      <input value={f.keyword} onChange={up("keyword")} className="mono" />
      <label>DM to commenters ({"{username}"} {"{link}"} {"{title}"})</label>
      <textarea value={f.dm_text} onChange={up("dm_text")} style={{ minHeight: 110 }} />
      <label>Public replies under the comment (one per line, picked at random)</label>
      <textarea value={f.public_replies} onChange={up("public_replies")} style={{ minHeight: 110 }} />
      <label>Public replies WITH the link, when "Link in comment reply" is on (one per line, must have {"{link}"}; {"{username}"} {"{title}"})</label>
      <textarea value={f.link_replies} onChange={up("link_replies")} style={{ minHeight: 110 }} />
      <label>Link comment on each post ({"{link}"} {"{title}"})</label>
      <textarea value={f.pin_text} onChange={up("pin_text")} style={{ minHeight: 70 }} />
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
