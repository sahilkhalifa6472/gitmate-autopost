import Link from "next/link";
import * as ig from "@/lib/ig";
import { events } from "@/lib/data";
import { get, storeKind } from "@/lib/store";
import { aiReady } from "@/lib/ai";
import { pick, ago } from "@/lib/pick";
import Accounts from "@/components/Accounts";
import { disconnect, runNow, saveReplyToken } from "./actions";

export const dynamic = "force-dynamic";
const fmt = (n?: number) => (n == null ? "–" : n >= 1e6 ? (n / 1e6).toFixed(1) + "M" : n >= 1e3 ? (n / 1e3).toFixed(1) + "k" : String(n));

export default async function Home({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { list, acc, q } = await pick(searchParams);
  const lastTick = await get<number>("last_tick", 0);
  let prof: Awaited<ReturnType<typeof ig.me>> | null = null, media: (ig.IgMedia & { ins: Record<string, number> })[] = [], igErr = "";
  if (acc) {
    try {
      prof = await ig.me(acc.token);
      const m = await ig.listMedia(acc.id, acc.token, 9);
      media = await Promise.all(m.map(async (x) => ({ ...x, ins: await ig.mediaInsights(x.id, acc.token) })));
    } catch (e: any) { igErr = e.message; }
  }
  const ev = acc ? (await events(150)).filter((e) => e.account === acc.id).slice(0, 25) : [];
  const setup = [!process.env.IG_APP_ID && "IG_APP_ID", !process.env.IG_APP_SECRET && "IG_APP_SECRET", !aiReady() && "ANTHROPIC_API_KEY",
    !process.env.CRON_SECRET && "CRON_SECRET", !process.env.WEBHOOK_VERIFY_TOKEN && "WEBHOOK_VERIFY_TOKEN", storeKind === "file" && "Upstash Redis"].filter(Boolean);

  return (
    <div className="wrap">
      <div className="ph"><div><h1>{acc ? "@" + acc.username : "Welcome"}</h1><div className="sub">Posting, auto DM aur AI replies, ek jagah</div></div></div>
      <Accounts list={list} acc={acc} path="/" />
      {q.ok && <div className="card msg" style={{ marginTop: 12 }}>✓ {q.ok}</div>}
      {q.err && <div className="card msg e" style={{ marginTop: 12 }}>{q.err}</div>}
      {setup.length > 0 && <div className="card msg e" style={{ marginTop: 12 }}>Vercel me ye set karna baaki hai: {setup.join(", ")} (SETUP.md dekho)</div>}

      {!acc && (
        <div className="card" style={{ marginTop: 16 }}>
          <h2>Instagram connect karo</h2>
          <p className="note">Business ya Creator account chahiye, aur wo Meta app me tester ki tarah add hona chahiye.</p>
          <div className="row" style={{ marginTop: 14 }}><a className="btn pri" href="/api/ig/connect">Continue with Instagram</a></div>
        </div>
      )}

      {acc && (
        <>
          <div className="grid g4" style={{ marginTop: 16 }}>
            <div className="card stat"><span>Followers</span><b>{fmt(prof?.followers_count)}</b></div>
            <div className="card stat"><span>Posts</span><b>{fmt(prof?.media_count)}</b></div>
            <div className="card stat"><span>Auto DM rules</span><b>{acc.rules.filter((r) => r.on).length}</b></div>
            <div className="card stat"><span>AI replies</span><b>{acc.ai_on ? "ON" : "OFF"}</b></div>
          </div>
          {(igErr || acc.last_error) && <div className="card msg e" style={{ marginTop: 12 }}>{acc.last_error || igErr}</div>}

          <div className="sec"><div className="lbl">Last 9 posts</div>
            <div className="card">
              {media.length === 0 ? <div className="empty">Koi post nahi mili.</div> : (
                <div className="media">{media.map((m) => (
                  <a key={m.id} href={m.permalink} target="_blank" rel="noreferrer">
                    <div className="thumb">{(m.thumbnail_url || m.media_url) ? <img src={m.thumbnail_url || m.media_url} alt="" /> : <div className="ph0" />}</div>
                    <div className="nums">▶ {fmt(m.ins.views)} · ♥ {fmt(m.ins.likes ?? m.like_count)} · 💬 {fmt(m.ins.comments ?? m.comments_count)}<br />reach {fmt(m.ins.reach)} · saves {fmt(m.ins.saved)}</div>
                  </a>
                ))}</div>
              )}
            </div>
          </div>

          <div className="sec"><div className="lbl">Activity</div>
            <div className="card">
              <div className="row" style={{ justifyContent: "space-between", marginBottom: 8 }}>
                <span className="note">Last run: {lastTick ? ago(lastTick) : "abhi tak nahi"}</span>
                <form action={runNow}><button className="btn sm">Run now</button></form>
              </div>
              {ev.length === 0 ? <div className="empty">Abhi koi activity nahi.</div> : ev.map((e, i) => (
                <div key={i} className={`ev${e.ok ? "" : " bad"}`}><time>{ago(Date.parse(e.at))}</time><span>{e.kind}: {e.text}</span></div>
              ))}
            </div>
          </div>

          <div className="sec"><div className="lbl">Account</div>
            <div className="card">
              <p className="note">Token: {ago(acc.token_at)} (60 din chalta hai, app khud 45 din pe refresh karta hai). Connected {ago(acc.connected_at)}.</p>
              <div className="row" style={{ marginTop: 12 }}>
                <a className="btn" href="/api/ig/connect">+ Account / Reconnect</a>
                <form action={disconnect}><input type="hidden" name="a" value={acc.id} /><button className="btn">Disconnect @{acc.username}</button></form>
              </div>
              <details style={{ marginTop: 16 }}>
                <summary className="note">Advanced: comments/DMs ke liye backup token (EAA…)</summary>
                <p className="note" style={{ margin: "8px 0" }}>Sirf tab use karo jab Auto DM ya Inbox me comments/DMs na dikhe. Graph API Explorer wala EAA token yahan paste karo (git.mate me yahi chala tha). Khali chhodo = normal token.</p>
                <form action={saveReplyToken} className="inrow">
                  <input type="hidden" name="a" value={acc.id} />
                  <input name="reply_token" type="password" placeholder={acc.reply_token ? "saved ✓ (naya paste karo ya khali karke save)" : "EAA…"} />
                  <button className="btn">Save</button>
                </form>
              </details>
            </div>
          </div>
        </>
      )}
      <p className="note" style={{ marginTop: 24 }}><Link href="/privacy">Privacy</Link> · <Link href="/data-deletion">Data deletion</Link></p>
    </div>
  );
}
