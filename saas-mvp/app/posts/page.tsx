import { posts } from "@/lib/data";
import { pick } from "@/lib/pick";
import Accounts from "@/components/Accounts";
import Uploader from "@/components/Uploader";
import { deletePost, retryPost } from "../actions";

export const dynamic = "force-dynamic";
const when = (ms: number) => new Date(ms).toLocaleString("en-IN", { timeZone: "Asia/Kolkata", day: "numeric", month: "short", hour: "numeric", minute: "2-digit" });

export default async function Posts({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { list, acc } = await pick(searchParams);
  if (!acc) return <div className="wrap"><div className="ph"><h1>Posts</h1></div><div className="card empty">Pehle Home pe Instagram connect karo.</div></div>;
  const mine = (await posts()).filter((p) => p.account === acc.id).sort((a, b) => b.at - a.at);
  return (
    <div className="wrap">
      <div className="ph"><div><h1>Posts</h1><div className="sub">Reel upload karo, abhi ya baad me auto post</div></div></div>
      <Accounts list={list} acc={acc} path="/posts" />
      <div className="grid g2" style={{ marginTop: 12 }}>
        <Uploader a={acc.id} />
        <div className="card">
          <h2>Queue <small>{mine.length}</small></h2>
          {mine.length === 0 ? <div className="empty">Abhi kuch nahi.</div> : <div className="plist">{mine.map((p) => (
            <div key={p.id} className="prow">
              <div className="hd"><span className="ttl">{p.caption.split("\n")[0] || "(no caption)"}</span><span className={`pill${p.status === "failed" ? " err" : p.status === "posted" ? " solid" : ""}`}>{p.status}</span></div>
              <small>{when(p.at)} IST{p.error ? ` · ${p.error.slice(0, 160)}` : ""}</small>
              <div className="row">
                {p.permalink && <a className="btn sm" href={p.permalink} target="_blank" rel="noreferrer">Open</a>}
                <a className="btn sm" href={p.video_url} target="_blank" rel="noreferrer">Video</a>
                {p.status === "failed" && <form action={retryPost}><input type="hidden" name="id" value={p.id} /><button className="btn sm">Retry</button></form>}
                {p.status !== "processing" && <form action={deletePost}><input type="hidden" name="id" value={p.id} /><button className="btn sm">Delete</button></form>}
              </div>
            </div>
          ))}</div>}
        </div>
      </div>
    </div>
  );
}
