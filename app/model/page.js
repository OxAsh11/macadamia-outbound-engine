import { getEnrichedAccounts } from "../../lib/data";

export const dynamic = "force-dynamic";

export default async function Model() {
  const { accounts, funnel } = await getEnrichedAccounts();
  const qualified = accounts.filter(a => a.icp.qualified);
  const bands = funnel?.full_universe_159?.bands || {};

  return (
    <>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Model</h1>
      <p className="note" style={{ marginBottom: 14 }}>
        Funnel projection (10,000-run Monte Carlo) at conservative, cold-brand-haircut rates — the same
        measurement discipline the engine applies to accounts: model the range, ship against it, read the deltas.
      </p>

      <div className="grid2">
        <section className="card">
          <h3>Projection @ full universe ({funnel?.full_universe_159?.universe || 159} accounts)</h3>
          <div className="funnel">
            {Object.entries(bands).map(([stage, b]) => (
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
            Sensitivity: reply quality is the #1 lever — which is exactly why every draft is grounded to a
            sourced signal and passes human review.
          </p>
        </section>

        <section className="card">
          <h3>Current base vs model</h3>
          <table>
            <tbody>
              <tr><td>Universe size</td><td><b>{accounts.length}</b></td></tr>
              <tr><td>Evidence-qualified</td><td><b>{qualified.length}</b> ({Math.round(qualified.length / Math.max(accounts.length, 1) * 100)}%)</td></tr>
              <tr><td>Sourced signals</td><td><b>{accounts.reduce((n, a) => n + a.signals.filter(s => s.url).length, 0)}</b></td></tr>
              <tr><td>Named contacts</td><td><b>{accounts.reduce((n, a) => n + a.contacts.filter(c => c.name).length, 0)}</b></td></tr>
              <tr><td>Grounded drafts</td><td><b>{accounts.reduce((n, a) => n + a.drafts.length, 0)}</b></td></tr>
            </tbody>
          </table>
          <p className="note" style={{ marginTop: 10 }}>
            Re-baselining note: the universe is being re-qualified against the Macadamia research dossier
            (small/mid process·mechanical·AEC engineering firms). The Monte Carlo re-runs on the
            re-qualified base — model follows evidence, not the reverse.
          </p>
        </section>
      </div>
    </>
  );
}
