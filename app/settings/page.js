import { GATE_A, GATE_B, GATE_C, DESIGNATIONS } from "../../lib/icp";

export const dynamic = "force-dynamic";

export default function Settings() {
  return (
    <>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Settings — the ICP framework, in the open</h1>
      <p className="note" style={{ marginBottom: 14 }}>
        Every weight below is derived from Macadamia&apos;s own public words (research dossier:
        YC launch, YC company page, Wintercircus interview, their homepage personas, the GTM job post,
        and their reference customer Proyectos Engineering). Change the inputs, and the pipeline re-qualifies.
      </p>

      <section className="card">
        <h3>Gate A — can Cooper plug in? (pass/fail)</h3>
        <div className="settings-row"><b>Firm type</b><span />
          <span>Must be an engineering-documentation firm: {GATE_A.firmType.pass.join(", ")} · excluded: {GATE_A.firmType.fail.join(", ")}</span></div>
        {Object.entries(GATE_A.domainCriticality).map(([dom, pts]) => (
          <div className="settings-row" key={dom}><span>{dom} domain</span><span className="w">+{pts}</span><span>quality-critical: audit trails are regulatory</span></div>
        ))}
      </section>

      <section className="card">
        <h3>Gate B — live pain evidence (URL required, else unqualified)</h3>
        {Object.entries(GATE_B.signals).map(([k, def]) => (
          <div className="settings-row" key={k}><span>{def.label}</span><span className="w">+{def.weight}</span><span>source URL mandatory ({def.requires})</span></div>
        ))}
      </section>

      <section className="card">
        <h3>Gate C — reachability</h3>
        <div className="settings-row"><span>Named contact</span><span className="w">+{GATE_C.namedQualityLead}</span><span>engineering leader per their launch ask</span></div>
        <div className="settings-row"><span>Geography</span><span />
          <span>{Object.entries(GATE_C.geography).slice(0, 8).map(([c, p]) => `${c} +${p}`).join(" · ")} …</span></div>
        <div className="settings-row"><span>Digital maturity</span><span className="w">+{GATE_C.digitalMaturityBonus}</span><span>{GATE_C.digitalMaturityKeywords.join(", ")}</span></div>
      </section>

      <section className="card">
        <h3>Target designations</h3>
        <table>
          <thead><tr><th>Priority</th><th>Designation</th><th>Derived from</th></tr></thead>
          <tbody>
            {DESIGNATIONS.map(d => (
              <tr key={d.role}><td><span className="pill info">{d.priority}</span></td><td><b>{d.role}</b></td><td style={{ color: "var(--dim)", fontSize: 11.5 }}>{d.why}</td></tr>
            ))}
          </tbody>
        </table>
      </section>
    </>
  );
}
