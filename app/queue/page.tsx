import Nav from "@/components/Nav";
import Act from "@/components/Act";
import UploadForm from "@/components/UploadForm";
import { getConfig, getQueue } from "@/lib/data";
import { fmtIn } from "@/lib/time";

export const dynamic = "force-dynamic";

export default async function QueuePage() {
  const [cfg, q] = await Promise.all([getConfig(), getQueue()]);
  const order = { posting: 0, queued: 1, failed: 2, skipped: 3, posted: 4 } as const;
  const rows = [...q].sort((a, b) => order[a.status] - order[b.status] || (a.status === "posted" ? Date.parse(b.posted_at!) - Date.parse(a.posted_at!) : 0));
  return (
    <>
      <Nav />
      <div className="wrap">
        <h1>Queue</h1>
        <div className="sub">Reels post from top to bottom, one per planned time. The daily reel task adds new ones here automatically.</div>
        <div className="grid g2">
          <div className="card">
            <h2>Reels <small>{q.filter((i) => i.status === "queued").length} waiting</small></h2>
            {rows.length ? (
              <div className="tw"><table>
                <thead><tr><th>Reel</th><th>Status</th><th>Actions</th></tr></thead>
                <tbody>
                  {rows.map((i) => (
                    <tr key={i.id}>
                      <td className="t">
                        <div>#{i.id} {i.title}</div>
                        <small>cover {(i.cover_offset_ms / 1000).toFixed(1)}s{i.duration_sec ? ` · ${Math.round(i.duration_sec)}s` : ""} · <a href={i.video_url} target="_blank">video</a>{i.permalink ? <> · <a href={i.permalink} target="_blank">on Instagram</a></> : null}</small>
                        {i.error && i.status !== "posted" && <div className="msg e">{i.error.slice(0, 160)}</div>}
                        {i.posted_at && <small><br />posted {fmtIn(cfg.timezone, Date.parse(i.posted_at))} NY</small>}
                      </td>
                      <td><span className={`pill ${i.status === "failed" ? "err" : i.status === "posting" || i.force ? "solid" : ""}`}>{i.force && i.status === "queued" ? "post now" : i.status}</span></td>
                      <td>
                        <div className="row">
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
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            ) : <div className="empty">Queue is empty.</div>}
          </div>
          <div className="card">
            <h2>Add a reel</h2>
            <UploadForm />
          </div>
        </div>
      </div>
    </>
  );
}
