"use client";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

// run: also nudge the engine every minute (a post in progress shouldn't wait for the external cron)
export default function AutoRefresh({ seconds = 30, run = false }: { seconds?: number; run?: boolean }) {
  const router = useRouter();
  useEffect(() => { const t = setInterval(() => router.refresh(), seconds * 1000); return () => clearInterval(t); }, [router, seconds]);
  useEffect(() => {
    if (!run) return;
    const go = () => fetch("/api/run", { method: "POST" }).then(() => router.refresh()).catch(() => {});
    go();
    const t = setInterval(go, 60e3);
    return () => clearInterval(t);
  }, [router, run]);
  return null;
}
