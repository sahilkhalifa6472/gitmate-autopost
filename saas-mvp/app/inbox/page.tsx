import Link from "next/link";
import * as ig from "@/lib/ig";
import { handoffs } from "@/lib/data";
import { pausedUsers } from "@/lib/engine";
import { pick, ago } from "@/lib/pick";
import Accounts from "@/components/Accounts";
import { sendReply, pauseAi } from "../actions";

export const dynamic = "force-dynamic";

export default async function Inbox({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { list, acc, q } = await pick(searchParams);
  if (!acc) return <div className="wrap"><div className="ph"><h1>Inbox</h1></div><div className="card empty">Pehle Home pe Instagram connect karo.</div></div>;
  const tok = acc.reply_token || acc.token;
  let convos: ig.IgConvo[] = [], err = "";
  try { convos = await ig.conversations(acc.id, tok, 25); } catch (e: any) { err = e.message; }
  const paused = await pausedUsers(acc.id);
  const needs = (await handoffs(50)).filter((h) => h.account === acc.id).slice(0, 10);
  const other = (c: ig.IgConvo) => c.participants?.data.find((p) => p.id !== acc.id);
  const sel = q.c ? convos.find((c) => other(c)?.id === q.c) : undefined;
  const selUser = q.c ? other(sel || ({} as ig.IgConvo)) || { id: q.c } : undefined;
  const thread = selUser ? (await ig.convoWith(acc.id, tok, selUser.id, 25).catch(() => [] as ig.IgMsg[])).reverse() : [];
  const link = (id: string) => `/inbox?a=${acc.id}&c=${id}`;

  return (
    <div className="wrap">
      <div className="ph"><div><h1>Inbox</h1><div className="sub">Saare DMs, aur jahan AI ko aapki zarurat hai</div></div></div>
      <Accounts list={list} acc={acc} path="/inbox" />
      {err && <div className="card msg e" style={{ marginTop: 12 }}>{err}<br />Agar permission error hai to Home → Advanced me backup token try karo.</div>}
      {needs.length > 0 && (
        <div className="card" style={{ marginTop: 12 }}>
          <h2>Needs you <small>AI ne yahan insaan ko bulaya</small></h2>
          {needs.map((h, i) => <div key={i} className="ev"><time>{ago(Date.parse(h.at))}</time><span><Link href={link(h.user_id)}>{h.username ? "@" + h.username : h.user_id}</Link>: &quot;{h.text.slice(0, 80)}&quot; · {h.why}</span></div>)}
        </div>
      )}
      <div className="grid g2" style={{ marginTop: 12 }}>
        <div className="card">
          <h2>Chats <small>{convos.length}</small></h2>
          {convos.length === 0 ? <div className="empty">Koi chat nahi mili.</div> : convos.map((c) => {
            const o = other(c); const last = c.messages?.data?.[0];
            return o ? (
              <Link key={c.id} href={link(o.id)} className="dm" style={{ display: "block", textDecoration: "none" }}>
                <div className="ln"><b>@{o.username || o.id}</b> <span className="who">{ago(Date.parse(c.updated_time))}{paused[o.id] ? " · AI paused" : ""}</span></div>
                <div className={`ln${last?.from?.id === acc.id ? " me" : ""}`}>{last?.from?.id === acc.id ? "You: " : ""}{(last?.message || "(media)").slice(0, 90)}</div>
              </Link>
            ) : null;
          })}
        </div>
        <div className="card">
          {!selUser ? <div className="empty">Left se chat choose karo.</div> : (
            <>
              <h2>@{"username" in selUser && selUser.username ? selUser.username : selUser.id}
                <form action={pauseAi} style={{ marginLeft: "auto" }}><input type="hidden" name="a" value={acc.id} /><input type="hidden" name="to" value={selUser.id} /><input type="hidden" name="on" value={paused[selUser.id] ? "0" : "1"} />
                  <button className="btn sm">{paused[selUser.id] ? "AI resume" : "AI pause"}</button></form>
              </h2>
              {thread.map((m) => <div key={m.id} className="dm"><div className={`ln${m.from?.id === acc.id ? " me" : ""}`}><span className="who">{m.from?.id === acc.id ? "you/AI" : "them"} · {ago(Date.parse(m.created_time))}</span><br />{m.message || "(media)"}</div></div>)}
              <form action={sendReply} className="inrow">
                <input type="hidden" name="a" value={acc.id} /><input type="hidden" name="to" value={selUser.id} />
                <input name="text" placeholder="Reply…" required /><button className="btn pri">Send</button>
              </form>
              <p className="note" style={{ marginTop: 8 }}>Instagram rule: aakhri message ke 24 ghante ke andar hi reply ja sakta hai.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
