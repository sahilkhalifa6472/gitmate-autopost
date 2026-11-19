import { getQueue } from "@/lib/data";

export const dynamic = "force-dynamic";

// Public page (no login): the repos of one weekly carousel. People who comment the keyword
// on the carousel get a DM card that opens this page.
export default async function WeekPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const it = (await getQueue()).find((i) => i.id === Number(id) && i.kind === "carousel");
  const links = it?.links || [];
  return (
    <div className="wrap" style={{ maxWidth: 560, paddingTop: 28, paddingBottom: 48 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
        <span className="bead" style={{ width: 44, height: 44, borderRadius: "50%", display: "grid", placeItems: "center", background: "#fff", color: "#000", fontFamily: "JetBrains Mono, monospace", fontWeight: 800 }}>&gt;_</span>
        <div><div style={{ fontWeight: 800, fontSize: 18 }}>@git.mate</div><div className="sub" style={{ margin: 0 }}>{it ? it.title : "Weekly repos"}</div></div>
      </div>
      {links.length ? (
        <div style={{ display: "grid", gap: 10 }}>
          {links.map((l, k) => (
            <a key={k} href={l.url} target="_blank" rel="noreferrer" className="card" style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", textDecoration: "none" }}>
              <span style={{ fontFamily: "JetBrains Mono, monospace", opacity: 0.5, width: 22 }}>{String(k + 1).padStart(2, "0")}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: "block", fontWeight: 700 }}>{l.title}</span>
                <span style={{ display: "block", fontSize: 12, opacity: 0.55, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{l.url.replace(/^https?:\/\//, "")}</span>
              </span>
              <span style={{ opacity: 0.6 }}>↗</span>
            </a>
          ))}
        </div>
      ) : <div className="card empty">Nothing here yet.</div>}
      <a href="https://www.instagram.com/git.mate/" className="btn pri" style={{ display: "block", textAlign: "center", marginTop: 22 }}>Follow @git.mate for more</a>
    </div>
  );
}
