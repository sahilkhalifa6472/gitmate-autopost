import Nav from "@/components/Nav";
import ArForm from "@/components/ArForm";
import LinkInput from "@/components/LinkInput";
import ReplyBox from "@/components/ReplyBox";
import * as ig from "@/lib/ig";
import { getConfig, getQueue } from "@/lib/data";
import { getAr, arEvents, linkFor } from "@/lib/autoreply";

export const dynamic = "force-dynamic";

const fmt = (s: string) => new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Kolkata", day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(new Date(s));

export default async function InboxPage() {
  const [cfg, q, ar, events] = await Promise.all([getConfig(), getQueue(), getAr(), arEvents(120)]);
  let media: ig.IgMedia[] = [], convos: ig.IgConvo[] = [], mediaErr = "", dmErr = "";
  if (cfg.ig_token && cfg.ig_user_id) {
    [media, convos] = await Promise.all([
      ig.listMedia(cfg.ig_user_id, cfg.ig_token, 15).catch((e) => { mediaErr = e.message; return []; }),
      ig.conversations(cfg.ig_user_id, cfg.ig_token, 25).catch((e) => { dmErr = e.message; return []; }),
    ]);
  }
  const sent = events.filter((e) => e.status === "sent").length;
  return (
    <>
      <Nav />
      <div className="wrap">
        <div className="ph"><h1>Inbox</h1></div>
        <div className="sub">Auto DMs for people who comment the keyword, your DMs, and links per post. Runs every 5 minutes with the cron.</div>
        {ar.last_error && <div className="warnbox">Last auto-reply run stopped: {ar.last_error}</div>}
        <div className="grid g2" style={{ marginTop: 16 }}>
          <div className="grid" style={{ alignContent: "start" }}>
            <ArForm enabled={ar.enabled} dm_enabled={ar.dm_enabled} keyword={ar.keyword} dm_text={ar.dm_text} dm_inbox_text={ar.dm_inbox_text} public_replies={ar.public_replies} default_link={ar.default_link} max_per_run={ar.max_per_run} />
            <div className="card">
              <h2>Activity <small>{ar.sent_total || 0} DMs sent in total{ar.last_run_at ? ` · last run ${fmt(ar.last_run_at)} IST` : ""}</small></h2>
              {events.length ? events.slice(0, 80).map((e, k) => (
                <div className="log" key={k}><time>{fmt(e.at)}</time><span className={`lv ${e.status === "sent" ? "ok" : e.status === "failed" ? "error" : "info"}`}>{e.kind}</span>
                  <span>@{e.username}: “{e.text}” {e.status === "sent" ? "→ DM sent" : e.status}{e.note ? ` (${e.note})` : ""}</span></div>
              )) : <div className="empty">Nothing yet. Turn it on and press Run now.</div>}
              {sent > 0 && <div className="msg">{sent} sent in the last {events.length} events.</div>}
            </div>
          </div>
          <div className="grid" style={{ alignContent: "start" }}>
            <div className="card">
              <h2>Post links <small>DM link per post (last 15 posts)</small></h2>
              {mediaErr ? <div className="msg e">{mediaErr}</div> : media.length ? (
                <div className="plist">{media.map((m) => {
                  const { link } = linkFor(ar, q, m.id);
                  const it = q.find((i) => i.media_id === m.id);
                  return (
                    <div className="prow" key={m.id}>
                      <div className="hd"><div className="ttl">{(it?.title || m.caption || "").split("\n")[0].slice(0, 80) || m.id}</div><span className="cc">💬 {m.comments_count ?? "–"}</span></div>
                      <small>{fmt(m.timestamp)} IST{m.permalink ? <> · <a href={m.permalink} target="_blank">open</a></> : null}{!link ? <> · <span style={{ color: "var(--err)" }}>no link yet</span></> : null}</small>
                      <LinkInput mediaId={m.id} value={ar.links[m.id] || ""} fallback={it?.link || ar.default_link} />
                    </div>
                  );
                })}</div>
              ) : <div className="empty">No posts found.</div>}
            </div>
            <div className="card">
              <h2>DMs <small>last 25 chats · reply works within 24h of their last message</small></h2>
              {dmErr ? <div className="msg e">Can't read DMs yet: {dmErr}</div> : convos.length ? convos.map((c) => {
                const other = c.participants?.data.find((p) => p.username !== cfg.username);
                const msgs = [...(c.messages?.data || [])].reverse();
                const open = Date.now() - Date.parse(c.updated_time) < 24 * 3600e3;
                return (
                  <div key={c.id} className="dm">
                    <div className="row"><b>@{other?.username || "user"}</b><span className="msg" style={{ marginTop: 0 }}>{fmt(c.updated_time)} IST</span></div>
                    {msgs.map((m) => (
                      <div key={m.id} className={`ln ${m.from?.username === cfg.username ? "me" : ""}`}>
                        <span className="who">{m.from?.username === cfg.username ? "you" : "them"} · </span>{m.message || "(media)"}
                      </div>
                    ))}
                    {other && open && <ReplyBox recipientId={other.id} username={other.username || ""} />}
                  </div>
                );
              }) : <div className="empty">No DMs found.</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
