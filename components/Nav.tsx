"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { ReactNode } from "react";

const I = (d: ReactNode) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const LINKS: [string, string, ReactNode][] = [
  ["/", "Home", I(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>)],
  ["/queue", "Queue", I(<><rect x="3" y="4" width="7" height="16" rx="2" /><path d="M14 6h7M14 12h7M14 18h7" /></>)],
  ["/logs", "Logs", I(<><path d="M4 6h16M4 12h10M4 18h13" /></>)],
  ["/settings", "Settings", I(<><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" /></>)],
];

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <>
      <div className="top">
        <div className="bar">
          <Link href="/" className="brand"><span className="bead">&gt;_</span>git.mate<small>autopost</small></Link>
          <div className="sp" />
          <button className="icobtn" aria-label="Log out" title="Log out" onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/login"); }}>
            {I(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>)}
          </button>
        </div>
      </div>
      <nav className="tabbar">
        {LINKS.map(([h, l, icon]) => <Link key={h} href={h} className={path === h ? "on" : ""}>{icon}{l}</Link>)}
      </nav>
    </>
  );
}
