"use client";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { ReactNode } from "react";

const I = (d: ReactNode) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">{d}</svg>;
const LINKS: [string, string, ReactNode][] = [
  ["/", "Home", I(<><path d="M3 10.5 12 3l9 7.5" /><path d="M5 9.5V20a1 1 0 0 0 1 1h4v-6h4v6h4a1 1 0 0 0 1-1V9.5" /></>)],
  ["/posts", "Posts", I(<><rect x="3" y="4" width="7" height="16" rx="2" /><path d="M14 6h7M14 12h7M14 18h7" /></>)],
  ["/rules", "Auto DM", I(<><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M8 9h8M8 13h5" /></>)],
  ["/inbox", "Inbox", I(<><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.5 5.1 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.5-6.9A2 2 0 0 0 16.7 4H7.3a2 2 0 0 0-1.8 1.1z" /></>)],
  ["/ai", "AI", I(<><path d="M12 3l1.9 4.6L18.5 9l-4.6 1.9L12 15.5l-1.9-4.6L5.5 9l4.6-1.4z" /><path d="M19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z" /></>)],
];

export default function Nav() {
  const path = usePathname();
  const a = useSearchParams().get("a");
  const router = useRouter();
  if (path === "/login" || path === "/privacy" || path === "/data-deletion") return null;
  return (
    <>
      <div className="top">
        <div className="bar">
          <Link href={a ? `/?a=${a}` : "/"} className="brand"><span className="bead">AP</span>autopilot<small>MVP</small></Link>
          <div className="sp" />
          <button className="icobtn" aria-label="Log out" title="Log out" onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/login"); }}>
            {I(<><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" /><path d="m16 17 5-5-5-5M21 12H9" /></>)}
          </button>
        </div>
      </div>
      <nav className="tabbar" style={{ gridTemplateColumns: "repeat(5,1fr)" }}>
        {LINKS.map(([h, l, icon]) => <Link key={h} href={a ? `${h}?a=${a}` : h} className={path === h ? "on" : ""}>{icon}{l}</Link>)}
      </nav>
    </>
  );
}
