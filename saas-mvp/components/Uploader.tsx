"use client";
import { useState } from "react";
import { upload } from "@vercel/blob/client";
import { addPost } from "@/app/actions";

export default function Uploader({ a }: { a: string }) {
  const [file, setFile] = useState<File | null>(null);
  const [caption, setCaption] = useState("");
  const [when, setWhen] = useState("");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <form className="card" onSubmit={async (e) => {
      e.preventDefault(); if (!file) return setMsg("Video choose karo");
      setBusy(true); setMsg("Uploading… 0%");
      try {
        const b = await upload(`reels/${file.name}`, file, { access: "public", handleUploadUrl: "/api/blob-upload", multipart: file.size > 20e6,
          onUploadProgress: (p) => setMsg(`Uploading… ${Math.round(p.percentage)}%`) });
        await addPost({ a, video_url: b.url, caption, at: when ? new Date(when).getTime() : Date.now() });
        setMsg(when ? "Scheduled ✓" : "Queue me ✓ (5 min me post hoga)"); setFile(null); setCaption(""); setWhen("");
        (e.target as HTMLFormElement).reset();
      } catch (err: any) { setMsg("Error: " + err.message); }
      setBusy(false);
    }}>
      <h2>Naya reel</h2>
      <label>Video (MP4, 9:16, 3-90 sec)</label>
      <input type="file" accept="video/mp4,video/quicktime" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <label style={{ marginTop: 12, display: "block" }}>Caption</label>
      <textarea rows={5} value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="Caption + hashtags. Tip: 'Comment LINK' likho aur Auto DM rule bana do" />
      <label style={{ marginTop: 12, display: "block" }}>Kab post kare? (khali = abhi)</label>
      <input type="datetime-local" value={when} onChange={(e) => setWhen(e.target.value)} />
      <div className="row" style={{ marginTop: 14 }}><button className="btn pri" disabled={busy}>{busy ? "…" : when ? "Schedule" : "Post now"}</button></div>
      {msg && <div className={`msg${msg.startsWith("Error") ? " e" : ""}`}>{msg}</div>}
    </form>
  );
}
