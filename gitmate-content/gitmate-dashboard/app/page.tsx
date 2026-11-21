import Link from "next/link";
import Nav from "@/components/Nav";
import Act from "@/components/Act";
import AutoRefresh from "@/components/AutoRefresh";
import { getConfig, getQueue, getPlans } from "@/lib/data";
import { getLogs, storeKind } from "@/lib/store";
import { windowScores } from "@/lib/engine";
import { tzParts, tzToUtc, fmtIn, hhmm } from "@/lib/time";

export const dynamic = "force-dynamic";
const IST = "Asia/Kolkata";
const n = (v?: number) => (v == null ? "–" : v >= 10000 ? `${(v / 1000).toFixed(1)}k` : String(v));

export default async function Dashboard() {
  const [cfg, q, plans, logs] = await Promise.all([getConfig(), getQueue(), getPlans(), getLogs(6)]);
  const { day, min } = tzParts(cfg.timezone);
  const today = plans[day] || [];
  const next = today.find((t) => !t.id && !t.skipped && t.min + 120 >= min);
  const nextMs = next ? tzToUtc(cfg.timezone, day, next.min) : null;
  const queued = q.filter((i) => i.status === "queued");
  const nextReel = queued.find((i) => i.force) || queued[0];
  const posting = q.find((i) => i.status === "posting");
  const posted = q.filter((i) => i.status === "posted").sort((a, b) => Date.parse(b.posted_at!) - Date.parse(a.posted_at!));
  const failed = q.filter((i) => i.status === "failed");
  const totalViews = posted.reduce((s, i) => s + (i.latest?.views || 0), 0);
  const measured = posted.filter((i) => i.snapshot);
  const avg12 = measured.length ? Math.round(measured.reduce((s, i) => s + (i.snapshot!.views || 0), 0) / measured.length) : null;
  const scores = windowScores(cfg, q);
  const maxAvg = Math.max(1, ...scores.map((s) => s.avg || 0));
  const daysLeft = cfg.posts_per_day ? Math.floor(queued.length / cfg.posts_per_day) : 0;

  return (
    <>
      <Nav />
      <AutoRefresh seconds={30} />
      <div className="wrap">
        <h1>Dashboard</h1>
        <div className="sub row">
          {cfg.username ? <span className="pill"><span className="dot on" />@{cfg.username} connected</span> : <span className="pill err">Instagram not connected · <Link href="/settings">Settings</Link></span>}
          {cfg.paused && <span className="pill err">Paused</span>}
          <span className="pill">{cfg.posts_per_day}/day · {cfg.timezone}</span>
          <span className="pill">Now {hhmm(min)} New York · {fmtIn(IST, Date.now()).split(", ")[1]} IST</span>
        </div>
        {storeKind === "file" && <div className="warnbox">No Upstash Redis connected. Data is only kept locally. Add Upstash Redis in Vercel → Storage.</div>}

        <div className="grid g2" style={{ marginTop: 18 }}>
          <div className="card">
            <h2>Next post</h2>
            {posting ? (
              <div className="hero"><div className="big">Posting…</div><div><b>#{posting.id} {posting.title}</b><div className="msg">Instagram is processing the video. It goes live in a few minutes.</div></div></div>
            ) : nextReel?.force ? (
              <div className="hero"><div className="big">Next run</div><div><b>#{nextReel.id} {nextReel.title}</b><div className="msg">"Post now" requested. It starts within 5 minutes.</div></div></div>
            ) : next && nextMs ? (
              <div className="hero">
                <div className="big mono">{hhmm(next.min)}</div>
                <div>
                  <div><b>{nextReel ? `#${nextReel.id} ${nextReel.title}` : "Queue is empty"}</b></div>
                  <div className="msg">New York time · {fmtIn(IST, nextMs)} IST</div>
                </div>
              </div>
            ) : (
              <div className="empty">No more posts planned today. Tomorrow's random time is picked after midnight New York time.</div>
            )}
            {nextReel && !posting && <div className="row" style={{ marginTop: 16 }}><Act url="/api/queue" method="PATCH" body={{ id: nextReel.id, action: "post_now" }} label="Post it now" confirm={`Post #${nextReel.id} now?`} /></div>}
          </div>
          <div className="card">
            <h2>Today's plan <small>{day}</small></h2>
            <div className="plan">
              {today.length ? today.map((t, i) => (
                <div className="slot" key={i}>
                  <span className="mono">{hhmm(t.min)} <span style={{ color: "var(--mut)" }}>NY · {fmtIn(IST, tzToUtc(cfg.timezone, day, t.min)).split(", ")[1]} IST</span></span>
                  <span className="pill">{t.id ? `#${t.id}` : t.skipped ? (t.note || "skipped") : t.min <= min ? "due" : "planned"}</span>
                </div>
              )) : <div className="empty">Plan is made on the next run.</div>}
            </div>
          </div>
        </div>

        <div className="grid g4" style={{ marginTop: 16 }}>
          <div className="card stat"><span>In queue</span><b>{queued.length}</b><span>{daysLeft} day{daysLeft === 1 ? "" : "s"} of posts</span></div>
          <div className="card stat"><span>Posted</span><b>{posted.length}</b><span>{failed.length ? `${failed.length} failed` : "no failures"}</span></div>
          <div className="card stat"><span>Total views</span><b>{n(totalViews)}</b><span>latest numbers</span></div>
          <div className="card stat"><span>Avg views at 12h</span><b>{n(avg12 ?? undefined)}</b><span>{measured.length} reels measured</span></div>
        </div>

        <div className="grid g2" style={{ marginTop: 16 }}>
          <div className="card">
            <h2>Recent posts</h2>
            {posted.length ? (
              <div className="tw"><table>
                <thead><tr><th>Reel</th><th className="num">Views</th><th className="num">Reach</th><th className="num">Likes</th><th className="num">Shares</th><th className="num">Saves</th></tr></thead>
                <tbody>
                  {posted.slice(0, 10).map((i) => (
                    <tr key={i.id}>
                      <td className="t"><div>{i.permalink ? <a href={i.permalink} target="_blank">#{i.id} {i.title}</a> : `#${i.id} ${i.title}`}</div><small>{fmtIn(cfg.timezone, Date.parse(i.posted_at!))} NY</small></td>
                      <td className="num">{n(i.latest?.views)}</td><td className="num">{n(i.latest?.reach)}</td><td className="num">{n(i.latest?.likes)}</td><td className="num">{n(i.latest?.shares)}</td><td className="num">{n(i.latest?.saved)}</td>
                    </tr>
                  ))}
                </tbody>
              </table></div>
            ) : <div className="empty">Nothing posted yet. Numbers show up 12 hours after each post.</div>}
          </div>
          <div className="card">
            <h2>Best time windows <small>avg views at 12h, NY time</small></h2>
            <div className="bars">
              {cfg.windows.map((w, i) => (
                <div className="bar" key={i}>
                  <span className="mono">{w[0]}–{w[1]}</span>
                  <div className="tr"><div className="fl" style={{ width: `${scores[i]?.avg ? Math.max(4, (scores[i].avg! / maxAvg) * 100) : 0}%` }} /></div>
                  <span className="lb">{scores[i]?.n ? `${n(scores[i].avg!)} · ${scores[i].n} reel${scores[i].n > 1 ? "s" : ""}` : "no data"}</span>
                </div>
              ))}
            </div>
            <div className="msg">Windows with more views get picked more often. 25% of picks stay random to keep testing.</div>
          </div>
        </div>

        <div className="card" style={{ marginTop: 16 }}>
          <h2>Latest activity <small><Link href="/logs">all logs →</Link></small></h2>
          {logs.length ? logs.map((l: any, k: number) => (
            <div className="log" key={k}><time>{fmtIn(IST, Date.parse(l.at))} IST</time><span className={`lv ${l.level}`}>{l.level}</span><span>{l.msg}</span></div>
          )) : <div className="empty">No activity yet.</div>}
        </div>
      </div>
    </>
  );
}
