import Nav from "@/components/Nav";
import SettingsForm from "@/components/SettingsForm";
import { getConfig } from "@/lib/data";
import { storeKind } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const cfg = await getConfig();
  const env = {
    "Upstash Redis": storeKind === "redis",
    "Vercel Blob": !!process.env.BLOB_READ_WRITE_TOKEN,
    "CRON_SECRET": (process.env.CRON_SECRET || "").length >= 8,
    "QUEUE_KEY": (process.env.QUEUE_KEY || "").length >= 16,
  };
  return (
    <>
      <Nav />
      <div className="wrap">
        <h1>Settings</h1>
        <div className="sub">Account, posting schedule and setup checks.</div>
        <SettingsForm username={cfg.username} timezone={cfg.timezone} windows={cfg.windows.map((w) => w.join("-")).join(",")} posts={cfg.posts_per_day} paused={cfg.paused} />
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Setup checks</h2>
          <div className="row">{Object.entries(env).map(([k, v]) => <span key={k} className={`pill ${v ? "" : "err"}`}><span className={`dot ${v ? "on" : ""}`} />{k}</span>)}</div>
          <div className="msg" style={{ lineHeight: 1.7 }}>
            5-minute timer: at cron-job.org create a job every 5 minutes for <span className="kbd">https://YOUR-APP.vercel.app/api/cron?key=CRON_SECRET</span>.
            Vercel's own cron (free plan) only runs once a day as a backup.
          </div>
        </div>
      </div>
    </>
  );
}
