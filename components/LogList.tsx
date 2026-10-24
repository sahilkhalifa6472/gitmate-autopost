"use client";
import { useState } from "react";

type L = { at: string; level: string; msg: string; id?: number };
const fmt = (s: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).format(new Date(s));

export default function LogList({ logs }: { logs: L[] }) {
  const [lv, setLv] = useState("all");
  const [qq, setQ] = useState("");
  const shown = logs.filter((l) => (lv === "all" || l.level === lv) && (!qq || l.msg.toLowerCase().includes(qq.toLowerCase())));
  return (
    <>
      <div className="row" style={{ marginBottom: 14 }}>
        {["all", "ok", "info", "warn", "error"].map((x) => <button key={x} className={`btn sm ${lv === x ? "pri" : ""}`} onClick={() => setLv(x)}>{x}</button>)}
        <div className="sp" />
        <input style={{ maxWidth: 260 }} placeholder="Search…" value={qq} onChange={(e) => setQ(e.target.value)} />
      </div>
      {shown.length ? shown.map((l, k) => (
        <div className="log" key={k}><time>{fmt(l.at)} IST</time><span className={`lv ${l.level}`}>{l.level}</span><span>{l.msg}</span></div>
      )) : <div className="empty">No log lines.</div>}
    </>
  );
}
