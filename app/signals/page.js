import Link from "next/link";
import { getEnrichedAccounts } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function Signals() {
  const { accounts } = await getEnrichedAccounts();
  const all = accounts.flatMap(a => a.signals.map(s => ({ ...s, company: a.company, icpQualified: a.icp.qualified })));
  const sourced = all.filter(s => s.url).sort((x, y) => String(y.discovered_at || "").localeCompare(String(x.discovered_at || "")));
  const byType = {};
  sourced.forEach(s => { byType[s.type] = (byType[s.type] || 0) + 1; });

  return (
    <>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Signals</h1>
      <p className="note" style={{ marginBottom: 14 }}>
        The evidence layer. A signal only exists here if it carries a source URL — project awards
        (documentation volume spikes), QA/QC hiring (pain made visible), and scanner news hits matched
        to the universe. {sourced.length} sourced signals · {Object.entries(byType).map(([t, n]) => `${t.replace("_", " ")}: ${n}`).join(" · ")}
      </p>
      <section className="card">
        {sourced.slice(0, 60).map(s => (
          <div className="sig" key={`${s.account_id}-${s.id}`}>
            <div className="co">
              <Link href={`/accounts/${encodeURIComponent(s.company)}`}>{s.company}</Link>{" "}
              <span className="pill info">{s.type.replace("_", " ")}</span>{" "}
              <span className="pill">strength {s.strength}</span>
            </div>
            <div className="meta">{String(s.discovered_at || "").slice(0, 10)} · via {s.source}</div>
            <div className="desc">{s.description}</div>
            <div className="src">source: <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a></div>
          </div>
        ))}
        {sourced.length > 60 && <p className="note">+ {sourced.length - 60} more in the local CRM</p>}
      </section>
    </>
  );
}
