import Link from "next/link";
import { getEnrichedAccounts } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function Accounts() {
  const { accounts } = await getEnrichedAccounts();
  const sorted = [...accounts].sort((a, b) => (b.icp.qualified - a.icp.qualified) || (b.icp.score - a.icp.score));
  return (
    <>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Accounts</h1>
      <p className="note" style={{ marginBottom: 16 }}>
        Every account in the universe. Qualified = passed firm-type gate + carries source-verified evidence.
        Click any row for the full profile: gate reasoning, signal timeline with sources, contacts, drafts.
      </p>
      <section className="card">
        <table>
          <thead>
            <tr><th>Company</th><th>Country</th><th>Tier / Sector</th><th>ICP</th><th>Qualified</th><th>Evidence</th><th>Contact</th><th>Stage</th></tr>
          </thead>
          <tbody>
            {sorted.map(a => (
              <tr key={a.id}>
                <td><Link href={`/accounts/${encodeURIComponent(a.company)}`}><b>{a.company}</b></Link></td>
                <td>{a.hq_country}</td>
                <td style={{ color: "var(--dim)", fontSize: 11.5 }}>{a.tier}</td>
                <td><span className="score">{a.icp.qualified ? a.icp.score : "—"}</span></td>
                <td>{a.icp.qualified ? <span className="pill ok">yes</span> : <span className="pill bad">no evidence</span>}</td>
                <td>{a.signals.filter(s => s.url).length || "—"}</td>
                <td>{a.icp.contact ? <span className="pill ok">{a.icp.contact.name}</span> : "—"}</td>
                <td><span className="pill">{a.stage}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
