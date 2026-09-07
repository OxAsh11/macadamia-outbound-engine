import Link from "next/link";
import { getEnrichedAccounts } from "../../lib/data";
import { KANBAN_STAGES } from "../../lib/icp";

export const dynamic = "force-dynamic";

export default async function Pipeline() {
  const { accounts } = await getEnrichedAccounts();
  return (
    <>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Pipeline</h1>
      <p className="note" style={{ marginBottom: 16 }}>
        Kanban movement is earned: an account advances only when evidence or work exists (signal URL →
        named contact → grounded draft → approval). Unqualified accounts stay backstage until a signal appears.
      </p>
      <div className="kanban">
        {KANBAN_STAGES.map(stage => {
          const items = accounts
            .filter(a => a.stage === stage.id)
            .sort((x, y) => y.icp.score - x.icp.score);
          return (
            <div className="kcol" key={stage.id}>
              <h4>{stage.label} <span>{items.length}</span></h4>
              <div className="hint">{stage.hint}</div>
              {items.slice(0, 40).map(a => (
                <Link key={a.id} href={`/accounts/${encodeURIComponent(a.company)}`} className="kcard">
                  <div className="co">{a.company}</div>
                  <div className="meta">{a.hq_country} · score {a.icp.score}</div>
                  <div className="badges">
                    {a.signals.filter(s => s.url).slice(0, 2).map((s, i) => (
                      <span key={i} className="pill info">{s.type.replace("_", " ")}</span>
                    ))}
                    {a.icp.contact && <span className="pill ok">contact</span>}
                    {a.drafts.length > 0 && <span className="pill warn">draft</span>}
                  </div>
                </Link>
              ))}
              {items.length > 40 && <p className="note">+ {items.length - 40} more</p>}
            </div>
          );
        })}
      </div>
    </>
  );
}
