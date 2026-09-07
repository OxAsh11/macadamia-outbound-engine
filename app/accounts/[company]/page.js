import Link from "next/link";
import { notFound } from "next/navigation";
import { getEnrichedAccounts } from "../../../lib/data";
import { DESIGNATIONS } from "../../../lib/icp";

export const dynamic = "force-dynamic";

export default async function AccountProfile({ params }) {
  const { accounts } = await getEnrichedAccounts();
  const company = decodeURIComponent(params.company);
  const a = accounts.find(x => x.company === company);
  if (!a) notFound();

  const signals = [...a.signals].sort((x, y) => String(y.discovered_at || "").localeCompare(String(x.discovered_at || "")));

  return (
    <>
      <div className="profile-head">
        <div>
          <Link href="/accounts" className="note">← all accounts</Link>
          <h1 style={{ marginTop: 4 }}>{a.company}</h1>
          <p className="note">{a.tier} · {a.sector}</p>
        </div>
        <div style={{ textAlign: "right" }}>
          <div className="score" style={{ fontSize: 30 }}>{a.icp.qualified ? a.icp.score : "—"}</div>
          <span className={`pill ${a.icp.qualified ? "ok" : "bad"}`}>{a.stage}</span>
        </div>
      </div>

      <div className="firmo" style={{ marginBottom: 16 }}>
        <div className="cell"><div className="k">HQ</div><div className="v">{a.hq_country || "—"}</div></div>
        <div className="cell"><div className="k">Tier</div><div className="v">{a.tier || "—"}</div></div>
        <div className="cell"><div className="k">Sector</div><div className="v">{a.sector || "—"}</div></div>
        <div className="cell"><div className="k">Signals (sourced)</div><div className="v">{a.signals.filter(s => s.url).length}</div></div>
        <div className="cell"><div className="k">Contacts</div><div className="v">{a.contacts.filter(c => c.name).length}</div></div>
      </div>

      <div className="grid2">
        <div>
          <section className="card">
            <h3>Why this account — gate breakdown</h3>
            <div className={`gate ${a.icp.gateA ? "pass" : "fail"}`}>
              <h4>Gate A — Firm type {a.icp.gateA ? "✓" : "✗"}</h4>
              <ul>{a.icp.reasons.filter(r => r.startsWith("A")).map((r, i) => <li key={i}>{r.replace(/^A [✓+]?\s*/, "")}</li>)}</ul>
            </div>
            <div className={`gate ${a.icp.qualified ? "pass" : "fail"}`}>
              <h4>Gate B — Live evidence {a.icp.qualified ? `✓ (${a.icp.evidenceSignals} sourced)` : "✗ none found"}</h4>
              <ul>{a.icp.reasons.filter(r => r.startsWith("B")).map((r, i) => <li key={i}>{r.replace(/^B \+\d+\s*/, "")}</li>)}</ul>
              {!a.icp.qualified && <ul><li>Parked — engine rescans daily; the moment a sourced signal appears, this account moves.</li></ul>}
            </div>
            <div className="gate pass">
              <h4>Gate C — Reachability</h4>
              <ul>{a.icp.reasons.filter(r => r.startsWith("C")).map((r, i) => <li key={i}>{r.replace(/^C \+\d+\s*/, "")}</li>)}</ul>
            </div>
          </section>

          <section className="card">
            <h3>Signal timeline — every entry sourced</h3>
            {signals.length === 0 && <p className="note">No signals yet. Account stays unqualified until one is verified.</p>}
            <div className="timeline">
              {signals.map(s => (
                <div className="titem" key={s.id}>
                  <div className="date">{String(s.discovered_at || "").slice(0, 10)}<br /><span className="pill info" style={{ fontSize: 9.5 }}>{s.type.replace("_", " ")}</span></div>
                  <div>
                    <div className="desc">{s.description}</div>
                    <div className="src">source: <a href={s.url} target="_blank" rel="noreferrer">{s.url}</a></div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div>
          <section className="card">
            <h3>Who to talk to</h3>
            {a.contacts.filter(c => c.name).length === 0 && (
              <p className="note">No named contact mapped yet — contact research queued for this account.</p>
            )}
            {a.contacts.filter(c => c.name).map(c => {
              const desig = DESIGNATIONS.find(d => (c.title || "").toLowerCase().includes(d.role.split(" / ")[0].toLowerCase().split(" ")[0]));
              return (
                <div className="person" key={c.id}>
                  <div>
                    <div className="nm">{c.name}</div>
                    <div className="ti">{c.title || "—"} {desig ? `· ${desig.priority} target` : ""}</div>
                  </div>
                  {c.linkedin_url && <a href={c.linkedin_url} target="_blank" rel="noreferrer" className="pill info">LinkedIn</a>}
                </div>
              );
            })}
            <p className="note" style={{ marginTop: 10 }}>
              Targeting doctrine: enter via Quality Director / PQM (owns the pain), arm as champion,
              reach Ops/Project Director for budget. Full map on <Link href="/contacts">Contacts</Link>.
            </p>
          </section>

          <section className="card">
            <h3>Grounded drafts</h3>
            {a.drafts.length === 0 && <p className="note">No draft — drafts generate only from verified signals.</p>}
            {a.drafts.map(d => (
              <div className="draft" key={d.id}>
                <div className="co">{d.stage} · <span className={`pill ${d.status === "DRAFT" ? "warn" : "ok"}`}>{d.status}</span></div>
                <div className="subj">{d.subject}</div>
                <pre>{d.body}</pre>
                {d.to_name && <p className="src">to: {d.to_name}</p>}
              </div>
            ))}
          </section>
        </div>
      </div>
    </>
  );
}
