import { pick } from "@/lib/pick";
import Accounts from "@/components/Accounts";
import { saveRule, toggleRule, deleteRule } from "../actions";

export const dynamic = "force-dynamic";

export default async function Rules({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { list, acc } = await pick(searchParams);
  if (!acc) return <div className="wrap"><div className="ph"><h1>Auto DM</h1></div><div className="card empty">Pehle Home pe Instagram connect karo.</div></div>;
  return (
    <div className="wrap">
      <div className="ph"><div><h1>Auto DM</h1><div className="sub">Koi keyword comment kare to usko DM jaye (ManyChat jaisa)</div></div></div>
      <Accounts list={list} acc={acc} path="/rules" />
      <div className="grid g2" style={{ marginTop: 12 }}>
        <form action={saveRule} className="card">
          <h2>Naya rule</h2>
          <input type="hidden" name="a" value={acc.id} />
          <label>Keyword (comment ya DM me)</label>
          <input name="keyword" placeholder="LINK" required />
          <label style={{ marginTop: 12 }}>DM message</label>
          <textarea name="dm_text" rows={3} required placeholder="Ye raha aapka link 👇" />
          <label style={{ marginTop: 12 }}>Link (optional, button ke saath jayega)</label>
          <input name="link" type="url" placeholder="https://..." />
          <label style={{ marginTop: 12 }}>Button text</label>
          <input name="button" placeholder="Open link" maxLength={20} />
          <label style={{ marginTop: 12 }}>Comment ke neeche public reply (optional)</label>
          <input name="public_reply" placeholder="DM check karo 📩" />
          <p className="note" style={{ marginTop: 10 }}>Link ho to message 80 characters tak (Instagram card limit). Rule sirf naye comments pe chalega, purane pe nahi.</p>
          <div className="row" style={{ marginTop: 12 }}><button className="btn pri">Save rule</button></div>
        </form>
        <div className="card">
          <h2>Rules <small>{acc.rules.length}</small></h2>
          {acc.rules.length === 0 ? <div className="empty">Abhi koi rule nahi.</div> : <div className="plist">{acc.rules.map((r) => (
            <div key={r.id} className="prow">
              <div className="hd"><span className="ttl mono">{r.keyword}</span><span className={`pill${r.on ? " solid" : ""}`}>{r.on ? "ON" : "OFF"}</span></div>
              <small>{r.dm_text}{r.link ? ` → ${r.link}` : ""}{r.public_reply ? ` · public: "${r.public_reply}"` : ""}</small>
              <div className="row">
                <form action={toggleRule}><input type="hidden" name="a" value={acc.id} /><input type="hidden" name="id" value={r.id} /><button className="btn sm">{r.on ? "Turn off" : "Turn on"}</button></form>
                <form action={deleteRule}><input type="hidden" name="a" value={acc.id} /><input type="hidden" name="id" value={r.id} /><button className="btn sm">Delete</button></form>
              </div>
            </div>
          ))}</div>}
        </div>
      </div>
    </div>
  );
}
