"use client";
import { useEffect, useRef } from "react";

// Shows one still frame of the reel: seeks to the cover time once metadata is in
export default function CoverVideo({ src, sec }: { src: string; sec: number }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current; if (!v) return;
    const go = () => { try { if (Math.abs(v.currentTime - sec) > 0.05) v.currentTime = Math.min(sec, (v.duration || sec + 1) - 0.1); } catch {} };
    if (v.readyState >= 1) go(); else v.addEventListener("loadedmetadata", go, { once: true });
  }, [sec]);
  return <video ref={ref} src={`${src}#t=${sec.toFixed(2)}`} preload="metadata" muted playsInline />;
}
