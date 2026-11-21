"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [["/", "Dashboard"], ["/queue", "Queue"], ["/logs", "Logs"], ["/settings", "Settings"]];

export default function Nav() {
  const path = usePathname();
  const router = useRouter();
  return (
    <div className="top">
      <div className="wrap">
        <Link href="/" className="brand"><span className="bead">&gt;_</span>git.mate</Link>
        <nav className="nav">
          {LINKS.map(([h, l]) => <Link key={h} href={h} className={path === h ? "on" : ""}>{l}</Link>)}
        </nav>
        <div className="sp" />
        <button className="btn sm" onClick={async () => { await fetch("/api/logout", { method: "POST" }); router.push("/login"); }}>Log out</button>
      </div>
    </div>
  );
}
