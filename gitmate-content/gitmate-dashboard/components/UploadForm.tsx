"use client";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function UploadForm() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [caption, setCaption] = useState("");
  const [cover, setCover] = useState("2.5");
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return setMsg("Choose an .mp4 first");
    setBusy(true); setMsg("Uploading video…");
    try {
      const dur = await new Promise<number>((res) => {
        const v = document.createElement("video"); v.preload = "metadata";
        v.onloadedmetadata = () => res(v.duration || 0); v.onerror = () => res(0);
        v.src = URL.createObjectURL(file);
      });
      const blob = await upload(`reels/${file.name}`, file, { access: "public", handleUploadUrl: "/api/blob-upload", multipart: file.size > 20e6 });
      const r = await fetch("/api/queue", { method: "POST", headers: { "content-type": "application/json" },
        body: JSON.stringify({ title, caption, video_url: blob.url, cover_offset_ms: Math.round(parseFloat(cover || "0") * 1000), duration_sec: dur }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "failed");
      setMsg(`Added as #${j.id}`); setFile(null); setTitle(""); setCaption("");
      router.refresh();
    } catch (err: any) { setMsg(`Error: ${err.message}`); }
    setBusy(false);
  }

  return (
    <form onSubmit={submit}>
      <label>Video (.mp4, 9:16)</label>
      <input type="file" accept="video/mp4,video/quicktime" onChange={(e) => setFile(e.target.files?.[0] || null)} />
      <label>Title (only for the dashboard)</label>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Anatomy skill" />
      <label>Instagram caption + hashtags</label>
      <textarea value={caption} onChange={(e) => setCaption(e.target.value)} placeholder={"Comment GITMATE and I'll send you the link 👇"} />
      <label>Cover frame (seconds into the video, pick a moment where everything is fully on screen)</label>
      <input value={cover} onChange={(e) => setCover(e.target.value)} inputMode="decimal" />
      <div className="row" style={{ marginTop: 16 }}><button className="btn pri" disabled={busy}>{busy ? "Uploading…" : "Add to queue"}</button></div>
      {msg && <div className={`msg ${msg.startsWith("Error") ? "e" : ""}`}>{msg}</div>}
    </form>
  );
}
