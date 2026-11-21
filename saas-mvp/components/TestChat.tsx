"use client";
import { useState } from "react";
import { testAi } from "@/app/actions";
type Turn = { from: "customer" | "us"; text: string };

// try the AI before turning it on (nothing goes to Instagram)
export default function TestChat({ a }: { a: string }) {
  const [turns, setTurns] = useState<Turn[]>([]);
  const [text, setText] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="card">
      <h2>Test chat <small>customer ban ke message karo</small></h2>
      {turns.length === 0 && <div className="empty">Jaise: &quot;price kya hai?&quot; ya &quot;kaise buy karu?&quot;</div>}
      {turns.map((t, i) => <div key={i} className="dm"><div className={`ln${t.from === "us" ? " me" : ""}`}><span className="who">{t.from === "us" ? "AI" : "Customer"}</span><br />{t.text}</div></div>)}
      {note && <div className="msg e">{note}</div>}
      <form className="inrow" onSubmit={async (e) => {
        e.preventDefault(); if (!text.trim()) return;
        const next: Turn[] = [...turns, { from: "customer", text }]; setTurns(next); setText(""); setBusy(true); setNote("");
        const out = await testAi(a, next);
        if (out.reply) setTurns([...next, { from: "us", text: out.reply }]);
        if (out.handoff) setNote(`Needs you: ${out.reason || "AI ne insaan ko bulaya"}`);
        setBusy(false);
      }}>
        <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message…" />
        <button className="btn pri" disabled={busy}>{busy ? "…" : "Send"}</button>
        <button type="button" className="btn" onClick={() => { setTurns([]); setNote(""); }}>Reset</button>
      </form>
    </div>
  );
}
