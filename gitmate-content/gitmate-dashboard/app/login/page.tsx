"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <div className="login">
      <form className="card" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true); setErr("");
        const r = await fetch("/api/login", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ password: pw }) });
        const j = await r.json().catch(() => ({}));
        setBusy(false);
        if (r.ok) router.push("/"); else setErr(j.error || "Login failed");
      }}>
        <div className="brand" style={{ marginBottom: 18 }}><span className="bead">&gt;_</span>git.mate autopost</div>
        <label>Password</label>
        <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoFocus />
        <div className="row" style={{ marginTop: 16 }}><button className="btn pri" disabled={busy}>{busy ? "…" : "Log in"}</button></div>
        {err && <div className="msg e">{err}</div>}
      </form>
    </div>
  );
}
