import Nav from "@/components/Nav";
import LogList from "@/components/LogList";
import AutoRefresh from "@/components/AutoRefresh";
import { getLogs } from "@/lib/store";

export const dynamic = "force-dynamic";

export default async function LogsPage() {
  const logs = await getLogs(800);
  return (
    <>
      <Nav />
      <AutoRefresh seconds={20} />
      <div className="wrap">
        <h1>Logs</h1>
        <div className="sub">Every run, post, insight check and error. Refreshes by itself.</div>
        <div className="card"><LogList logs={logs as any} /></div>
      </div>
    </>
  );
}
