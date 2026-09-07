import Link from "next/link";
import { getEnrichedAccounts } from "../lib/data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const { accounts, mode } = await getEnrichedAccounts();
  const qualified = accounts.filter(a => a.icp.qualified);
  const unqualified = accounts.length - qualified.length;
  const withContacts = qualified.filter(a => a.icp.contact);
  const signalsWithSource = accounts.reduce((n, a) => n + a.signals.filter(s => s.url).length, 0);
  const drafts = accounts.reduce((n, a) => n + a.drafts.length, 0);
  const ready = accounts.filter(a => a.stage === "ready").length;

  return (
    <>
      <section className="hero">
        <h1>An outbound engine that earns its accounts.</h1>
        <p>
          This product finds EPC & engineering firms that need Macadamia&apos;s AI agents (QA/QC paperwork
          executed inside engineering tools, human-reviewed) — but only when public <b>evidence</b> says so.
          An account enters the pipeline only if it passes the <b>firm-type gate</b> and carries at least one
          <b> source-verified signal</b>: a project award about to spike documentation volume, or a live
          QA/QC vacancy where the pain is visible. Every claim on every page links to its source.
        </p>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <span className="tag">Gate A: firm type</span>
          <span className="tag">Gate B: evidence signals (URL-required)</span>
          <span className="tag">Gate C: reachability</span>
          <span className="tag">Agents draft · humans judge</span>
        </div>
      </section>

      <div className="kpis">
        <div className="kpi"><div className="n">{accounts.length}</div><div className="l">accounts in universe</div></div>
        <div className="kpi"><div className="n">{qualified.length}</div><div className="l">evidence-qualified (in pipeline)</div></div>
        <div className="kpi"><div className="n">{unqualified}</div><div className="l">parked — no evidence signal yet</div></div>
        <div className="kpi"><div className="n">{signalsWithSource}</div><div className="l">signals with source URLs</div></div>
        <div className="kpi"><div className="n">{withContacts.length}</div><div className="l">with named contact mapped</div></div>
        <div className="kpi"><div className="n">{drafts}</div><div className="l">grounded drafts (review-gated)</div></div>
      </div>

      <div className="grid2">
        <section className="card">
          <h3>Top qualified accounts — evidence-ranked</h3>
          <table>
            <thead><tr><th>Company</th><th>Country</th><th>ICP</th><th>Evidence</th><th>Contact</th><th>Stage</th></tr></thead>
            <tbody>
              {qualified.slice(0, 10).map(a => (
                <tr key={a.id}>
                  <td><Link href={`/accounts/${encodeURIComponent(a.company)}`}><b>{a.company}</b></Link></td>
                  <td>{a.hq_country}</td>
                  <td><span className="score">{a.icp.score}</span><div className="bar"><i style={{ width: `${a.icp.score}%` }} /></div></td>
                  <td>{a.icp.evidenceSignals} ✓</td>
                  <td>{a.icp.contact ? <span className="pill ok">named</span> : <span className="pill">—</span>}</td>
                  <td><Link href={`/accounts/${encodeURIComponent(a.company)}`} className="pill info">{a.stage}</Link></td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="note" style={{ marginTop: 8 }}>
            Ranking = evidence, not vibes: Gate-A domain criticality + Gate-B signal weights (project award +14,
            QA hiring +14) + Gate-C reachability. Full framework tunable in <Link href="/settings">Settings</Link>.
          </p>
        </section>

        <section className="card">
          <h3>How the engine works</h3>
          <div className="gate pass">
            <h4>1 · Discover — the signal engine</h4>
            <ul>
              <li>Daily scan: project-award news + QA/QC vacancy posts across the EPC universe</li>
              <li>New ICP-matching companies land in a discovery queue for triage</li>
              <li>Nothing becomes a &quot;signal&quot; without a source URL</li>
            </ul>
          </div>
          <div className="gate pass">
            <h4>2 · Qualify — the gates</h4>
            <ul>
              <li><b>Gate A</b> firm type: produces engineering documentation at volume?</li>
              <li><b>Gate B</b> live evidence: award spike or QA hiring, source-verified?</li>
              <li><b>Gate C</b> reachability: named quality leader, geography, digital maturity</li>
            </ul>
          </div>
          <div className="gate pass">
            <h4>3 · Engage — humans judge</h4>
            <ul>
              <li>E1 drafts generated only from verified signals (claim-grounding per line)</li>
              <li>Right person, right designation: Quality Director / PQM first (see <Link href="/contacts">Contacts</Link>)</li>
              <li>Review gate before anything sends; live funnel vs Monte Carlo model</li>
            </ul>
          </div>
        </section>
      </div>

      <section className="card">
        <h3>Pipeline snapshot</h3>
        <div className="kanban">
          {[["signal-verified", "Signal-Verified"], ["contact-mapped", "Contact-Mapped"], ["drafting", "Drafting"], ["ready", "Ready"]].map(([stage, label]) => {
            const items = accounts.filter(a => a.stage === stage);
            return (
              <div className="kcol" key={stage}>
                <h4>{label} <span>{items.length}</span></h4>
                <div className="hint">{items.length ? `${items.slice(0, 3).map(a => a.company).join(", ")}${items.length > 3 ? "…" : ""}` : "—"}</div>
                {items.slice(0, 4).map(a => (
                  <Link key={a.id} href={`/accounts/${encodeURIComponent(a.company)}`} className="kcard">
                    <div className="co">{a.company}</div>
                    <div className="meta">{a.hq_country} · score {a.icp.score}</div>
                  </Link>
                ))}
              </div>
            );
          })}
        </div>
        <p className="note" style={{ marginTop: 8 }}>Full board with all accounts on the <Link href="/pipeline">Pipeline</Link> page.</p>
      </section>
    </>
  );
}
