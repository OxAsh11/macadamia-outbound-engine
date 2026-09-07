import { getAccounts, getSignals, getContacts, getDrafts, getRuns, getFunnelProjection, mode } from "../lib/data";

export const dynamic = "force-dynamic";

const TABS = ["Pipeline", "Accounts", "Signals", "Drafts", "Model"];

function Score({ v }) {
  return (
    <div>
      <span className="score">{v}</span>
      <div className="bar"><i style={{ width: `${v}%` }} /></div>
    </div>
  );
}

export default async function Home() {
  const [accounts, signals, contacts, drafts, runs, funnel] = await Promise.all([
    getAccounts(), getSignals(), getContacts(), getDrafts(), getRuns(), getFunnelProjection(),
  ]);
  const ready = accounts.filter(a => (a.status || "").includes("ready"));
  const named = contacts.filter(c => c.name).length;
  const byCountry = {};
  accounts.forEach(a => { const c = a.hq_country || "?"; byCountry[c] = (byCountry[c] || 0) + 1; });
  const countries = Object.entries(byCountry).sort((x, y) => y[1] - x[1]);

  return (
    <div className="wrap">
      <header className="hd">
        <div>
          <h1>🥜 Macadamia Outbound Engine</h1>
          <p className="sub">
            Discovers EPC accounts matching Macadamia&apos;s ICP from public signals, scores them on evidence,
            manages pipeline, and drafts grounded outreach — agents draft, humans judge.
            Built by <b>Ashish Mishra</b> for the Founding GTM Lead application · Sep 2026.
          </p>
        </div>
        <div className="mode-badge">data mode: <b>{mode}</b></div>
      </header>

      <div className="kpis">
        <div className="kpi"><div className="n">{accounts.length}</div><div className="l">EPC accounts in universe</div></div>
        <div className="kpi"><div className="n">{signals.length}</div><div className="l">verified signals</div></div>
        <div className="kpi"><div className="n">{ready.length}</div><div className="l">ICP-ready (score ≥ 60)</div></div>
        <div className="kpi"><div className="n">{named}</div><div className="l">named quality leads</div></div>
        <div className="kpi"><div className="n">{drafts.length}</div><div className="l">grounded E1 drafts</div></div>
      </div>

      {/* PIPELINE */}
      <section className="card">
        <h3>Pipeline — evidence-scored universe</h3>
        <table>
          <thead><tr><th>Company</th><th>Country</th><th>ICP fit</th><th>Status</th><th>Signals</th></tr></thead>
          <tbody>
            {accounts.slice(0, 25).map(a => {
              const nsig = signals.filter(s => s.account_id === a.id).length;
              return (
                <tr key={a.id}>
                  <td><b>{a.company}</b></td>
                  <td>{a.hq_country}</td>
                  <td><Score v={a.icp_fit_score} /></td>
                  <td><span className={`pill ${a.status}`}>{a.status}</span></td>
                  <td>{nsig || "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <p className="note" style={{ marginTop: 8 }}>{accounts.length - 25 > 0 ? `+ ${accounts.length - 25} more in the full universe · ` : ""}Coverage: {countries.slice(0, 8).map(([c, n]) => `${c} ${n}`).join(" · ")}</p>
      </section>

      {/* SIGNALS */}
      <section className="card">
        <h3>How accounts are found — the signal engine</h3>
        <p className="note" style={{ marginBottom: 10 }}>
          Daily scan of public sources (project-award news, QA/QC vacancy posts, certification news) against the
          EPC universe. A signal is only written when verifiable (source URL). Score boosts: project win +12 ·
          live QA hiring +12 · named quality lead +8 · Benelux walk-in +15.
        </p>
        {signals.slice(0, 12).map(s => (
          <div className="sig" key={s.id}>
            <div className="co">{s.company || `account #${s.account_id}`} <span className="pill">{s.type}</span></div>
            <div className="meta">strength {s.strength} · {String(s.discovered_at || "").slice(0, 10)} · via {s.source}</div>
            <div className="desc">{(s.description || "").slice(0, 240)}</div>
            {s.url && <a href={s.url} target="_blank" rel="noreferrer">{String(s.url).slice(0, 80)}</a>}
          </div>
        ))}
        <p className="note">{signals.length} signals total · scanner runs daily 08:00 IST</p>
      </section>

      {/* DRAFTS */}
      <section className="card">
        <h3>Grounded E1 drafts (top 6 by ICP fit)</h3>
        {drafts.slice(0, 6).map(d => (
          <div className="draft" key={d.id}>
            <div className="hd">
              <div>
                <div className="co">{d.company}</div>
                <div className="subj">{d.subject}</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <span className="pill">{d.stage}</span>{" "}
                <span className="pill ready">{d.status}</span>
                <div className="note" style={{ marginTop: 4 }}>to: {d.to_name || "unnamed — generic salutation"}</div>
              </div>
            </div>
            <pre>{d.body}</pre>
          </div>
        ))}
        <p className="note">Every draft carries claim-grounding metadata (signal source URL) — nothing sends without human review.</p>
      </section>

      {/* MODEL */}
      <section className="card">
        <h3>Funnel model — 10,000-run Monte Carlo @ {funnel?.full_universe_159?.universe || 159} accounts</h3>
        <div className="funnel">
          {Object.entries((funnel?.full_universe_159?.bands) || {}).map(([stage, b]) => (
            <div className="frow" key={stage}>
              <div className="fstage">{stage}</div>
              <div className="fbarwrap">
                <div className="p10" style={{ width: `${Math.min(b.p10 / 5.4, 100)}%` }} />
                <div className="p50" style={{ width: `${Math.min((b.p50 - b.p10) / 5.4, 100)}%` }} />
                <div className="p90" style={{ width: `${Math.min((b.p90 - b.p50) / 5.4, 100)}%` }} />
              </div>
              <div className="fnum">P10 {b.p10} · <b>P50 {b.p50}</b> · P90 {b.p90}</div>
            </div>
          ))}
        </div>
        <p className="note" style={{ marginTop: 10 }}>
          Conservative rates (cold-brand haircut). The #1 sensitivity lever is reply quality — which is why the
          engine grounds every claim before a draft exists. Local CRM tracks live sends against these bands.
        </p>
      </section>

      <footer>
        Engine: SQLite core → Supabase (schema included) · scanner (Google News RSS × ICP queries) ·
        evidence-anchored scoring · human review gate · Monte Carlo measurement.
        All data from public sources — no confidential information from any employer.
        Runs: {runs.length} logged · Data mode: {mode}.
      </footer>
    </div>
  );
}
