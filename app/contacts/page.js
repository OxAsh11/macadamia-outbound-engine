import Link from "next/link";
import { getEnrichedAccounts } from "../../lib/data";
import { DESIGNATIONS } from "../../lib/icp";

export const dynamic = "force-dynamic";

export default async function Contacts() {
  const { accounts } = await getEnrichedAccounts();
  const withContacts = accounts.filter(a => a.contacts.some(c => c.name));
  const people = withContacts.flatMap(a => a.contacts.filter(c => c.name).map(c => ({ ...c, company: a.company, qualified: a.icp.qualified, score: a.icp.score })));

  return (
    <>
      <h1 style={{ fontSize: 20, marginBottom: 4 }}>Contacts</h1>
      <p className="note" style={{ marginBottom: 14 }}>
        Targeting doctrine derived from Macadamia&apos;s own words: their launch ask is
        &quot;engineering leaders&quot;; their reference customer is founder-led. Enter via the
        engineering leader (owns the pain) → arm as champion → founder/ops for budget.
        Contact research is prioritized for evidence-qualified accounts first.
      </p>

      <div className="grid2">
        <section className="card">
          <h3>Who we talk to — and why (source: their words)</h3>
          <table>
            <thead><tr><th>Priority</th><th>Designation</th><th>Basis</th></tr></thead>
            <tbody>
              {DESIGNATIONS.map(d => (
                <tr key={d.role}>
                  <td><span className="pill info">{d.priority}</span></td>
                  <td><b>{d.role}</b></td>
                  <td style={{ color: "var(--dim)", fontSize: 11.5 }}>{d.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="card">
          <h3>Mapped contacts ({people.length})</h3>
          {people.length === 0 && <p className="note">No named contacts mapped yet — contact research queue runs on evidence-qualified accounts first.</p>}
          {people.map(c => (
            <div className="person" key={`${c.account_id}-${c.id}`}>
              <div>
                <div className="nm">{c.name}</div>
                <div className="ti"><Link href={`/accounts/${encodeURIComponent(c.company)}`}>{c.company}</Link> · {c.title || "—"}</div>
              </div>
              {c.linkedin_url
                ? <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="pill info">LinkedIn</a>
                : <span className="pill">no URL</span>}
            </div>
          ))}
          <p className="note" style={{ marginTop: 10 }}>
            Discipline: a LinkedIn URL is only recorded when verified from a public source; emails are
            never guessed — they&apos;re found via verification waterfall at send time, after human review.
          </p>
        </section>
      </div>
    </>
  );
}
