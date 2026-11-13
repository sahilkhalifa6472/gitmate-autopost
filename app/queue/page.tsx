import Nav from "@/components/Nav";
import Act from "@/components/Act";
import UploadForm from "@/components/UploadForm";
import Thumb from "@/components/Thumb";
import { getConfig, getQueue } from "@/lib/data";
import { fmtIn } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const [cfg, q] = await Promise.all([getConfig(), getQueue()]);
  const order = { posting: 0, queued: 1, failed: 2, skipped: 3, posted: 4 } as const;
  const rows = [...q].sort((a, b) => order[a.status] - order[b.status] || (a.status === "posted" ? Date.parse(b.posted_at!) - Date.parse(a.posted_at!) : 0));
  const GROUPS: [string, (i: (typeof rows)[number]) => boolean][] = [["Posting now", (i) => i.status === "posting"], ["Up next", (i) => i.status === "queued"], ["Failed", (i) => i.status === "failed"], ["Skipped", (i) => i.status === "skipped"], ["Posted", (i) => i.status === "posted"]];
  return (
    <>
      <Nav />
      <div className="wrap">
        <div className="ph"><h1>Queue</h1><span className="pill solid">{q.filter((i) => i.status === "queued").length} waiting</span></div>
        <div className="sub">Reels post from top to bottom, one per planned time. The daily reel task adds new ones here automatically.</div>
        <details className="add">
          <summary><span className="btn pri">+ Add a reel</span></summary>
          <div className="card"><UploadForm /></div>
        </details>
        {rows.length ? GROUPS.map(([name, f]) => {
          const list = rows.filter(f);
          if (!list.length) return null;
          return (
            <div className="sec" key={name}>
              <div className="lbl">{name} · {list.length}</div>
              <div className="cards c3">
                {list.map((i) => (
                  <div className="card reel" key={i.id}>
                    <Thumb item={i} />
                    <div className="body">
                      <div className="hd"><span className="id">#{i.id}</span><span className={`pill ${i.status === "failed" ? "err" : i.status === "posting" || i.force ? "solid" : ""}`}>{i.force && i.status === "queued" ? "post now" : i.status}</span>{i.post_on && i.status === "queued" && <span className="pill solid">📅 {new Date(i.post_on + "T12:00:00Z").toLocaleDateString("en-GB", { day: "2-digit", month: "short" })}</span>}</div>
                      <div className="ttl">{i.title}</div>
                      <div className="meta">
                        cover {(i.cover_offset_ms / 1000).toFixed(1)}s{i.duration_sec ? ` · ${Math.round(i.duration_sec)}s` : ""}{!i.blob_deleted && <> · <a href={i.video_url} target="_blank">video</a></>}{i.permalink ? <> · <a href={i.permalink} target="_blank">on Instagram</a></> : null}
                        {i.posted_at && <><br />posted {fmtIn(cfg.timezone, Date.parse(i.posted_at))} NY</>}
                      </div>
                      {i.error && i.status !== "posted" && <div className="msg e">{i.error.slice(0, 160)}</div>}
                      <div className="acts">
                        {i.status === "queued" && <>
                          <Act url="/api/queue" method="PATCH" body={{ id: i.id, action: "up" }} label="↑" />
                          <Act url="/api/queue" method="PATCH" body={{ id: i.id, action: "down" }} label="↓" />
                          <Act url="/api/queue" method="PATCH" body={{ id: i.id, action: "post_now" }} label="Post now" confirm={`Post #${i.id} now?`} />
                          <Act url="/api/queue" method="PATCH" body={{ id: i.id, action: "skip" }} label="Skip" />
                        </>}
                        {i.status === "skipped" && <Act url="/api/queue" method="PATCH" body={{ id: i.id, action: "unskip" }} label="Back to queue" />}
                        {i.status === "failed" && <Act url="/api/queue" method="PATCH" body={{ id: i.id, action: "retry" }} label="Retry" />}
                        {i.status !== "posting" && <Act url="/api/queue" method="PATCH" body={{ id: i.id, action: "delete" }} label="Delete" confirm={`Delete #${i.id} from the list?`} />}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        }) : <div className="card empty" style={{ marginTop: 16 }}>Queue is empty.</div>}
      </div>
    </>
  );
}
