import { pick } from "@/lib/pick";
import { aiReady, AI_MODEL } from "@/lib/ai";
import Accounts from "@/components/Accounts";
import TestChat from "@/components/TestChat";
import { saveBrain, toggleAi } from "../actions";

export const dynamic = "force-dynamic";

export default async function Ai({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { list, acc } = await pick(searchParams);
  if (!acc) return <div className="wrap"><div className="ph"><h1>AI</h1></div><div className="card empty">Pehle Home pe Instagram connect karo.</div></div>;
  return (
    <div className="wrap">
      <div className="ph"><div><h1>AI replies</h1><div className="sub">AI sirf aapke Business Brain se DM ka jawab dega</div></div></div>
      <Accounts list={list} acc={acc} path="/ai" />
      {!aiReady() && <div className="card msg e" style={{ marginTop: 12 }}>ANTHROPIC_API_KEY Vercel me set karo, tab AI chalega.</div>}
      <div className="card" style={{ marginTop: 12 }}>
        <div className="row" style={{ justifyContent: "space-between" }}>
          <div><b>AI auto reply: {acc.ai_on ? "ON" : "OFF"}</b><div className="note">Pehle neeche Test chat me check karo, phir ON karo. Model: {AI_MODEL}. Limit 60 replies/hour.</div></div>
          <form action={toggleAi}><input type="hidden" name="a" value={acc.id} /><button className={`btn${acc.ai_on ? "" : " pri"}`}>{acc.ai_on ? "Turn OFF" : "Turn ON"}</button></form>
        </div>
      </div>
      <div className="grid g2" style={{ marginTop: 12 }}>
        <form action={saveBrain} className="card">
          <h2>Business Brain</h2>
          <input type="hidden" name="a" value={acc.id} />
          <label>Aap kya bechte ho: products, price, links, FAQ, rules</label>
          <textarea name="brain" rows={16} defaultValue={acc.brain} />
          <label style={{ marginTop: 12 }}>AI ka goal</label>
          <input name="goal" defaultValue={acc.goal} placeholder="Interested logon ko checkout link bhejna, call book karwana" />
          <label style={{ marginTop: 12 }}>Tone</label>
          <input name="tone" defaultValue={acc.tone} placeholder="Friendly Hinglish, short, max 1 emoji" />
          <p className="note" style={{ marginTop: 10 }}>Safety hamesha ON: AI payment/UPI/crypto nahi maangega, price guess nahi karega, &quot;stop&quot; bole to ruk jayega, samajh na aaye to Inbox me &quot;Needs you&quot; me daalega.</p>
          <div className="row" style={{ marginTop: 12 }}><button className="btn pri">Save</button></div>
        </form>
        <TestChat a={acc.id} />
      </div>
    </div>
  );
}
