#!/usr/bin/env python3
"""Generate lib/snapshot.json from engine/crm.db (+ funnel projection).
The deployed app reads Supabase when configured; otherwise this snapshot
guarantees the demo link always works."""
import sqlite3, json, os, sys

HERE = os.path.dirname(os.path.abspath(__file__))
DB = os.path.join(HERE, "..", "macadamia-application", "engine", "crm.db")
FUNNEL = os.path.join(HERE, "..", "macadamia-application", "demo-data", "04_funnel_projection.json")
OUT = os.path.join(HERE, "lib", "snapshot.json")

con = sqlite3.connect(os.path.abspath(DB))
con.row_factory = sqlite3.Row

accounts = [dict(r) for r in con.execute("SELECT * FROM accounts ORDER BY icp_fit_score DESC")]
signals = [dict(r) for r in con.execute("""
    SELECT s.*, a.company FROM signals s JOIN accounts a ON a.id=s.account_id
    ORDER BY s.discovered_at DESC, s.strength DESC LIMIT 500""")]
contacts = [dict(r) for r in con.execute("""
    SELECT c.*, a.company FROM contacts c JOIN accounts a ON a.id=c.account_id""")]
drafts = [dict(r) for r in con.execute("""
    SELECT d.id, d.stage, d.subject, d.body, d.grounding_json, d.status, d.created_at,
           a.company, a.icp_fit_score, c.name AS to_name, c.linkedin_url AS to_linkedin
    FROM drafts d JOIN accounts a ON a.id=d.account_id
    LEFT JOIN contacts c ON c.id=d.contact_id
    WHERE d.status != 'KILLED' ORDER BY a.icp_fit_score DESC""")]
runs = [dict(r) for r in con.execute("SELECT * FROM runs ORDER BY id DESC LIMIT 20")]
con.close()

funnel = json.load(open(os.path.abspath(FUNNEL), encoding="utf-8")) if os.path.exists(os.path.abspath(FUNNEL)) else {}

snap = {
    "generated_at": __import__("datetime").datetime.utcnow().isoformat() + "Z",
    "mode_note": "Snapshot from local engine CRM (SQLite). Live Supabase wiring documented in README.",
    "accounts": accounts, "signals": signals, "contacts": contacts,
    "drafts": drafts, "runs": runs, "funnel_projection": funnel,
}
os.makedirs(os.path.dirname(OUT), exist_ok=True)
json.dump(snap, open(OUT, "w", encoding="utf-8"), indent=1, default=str)
print(json.dumps({"accounts": len(accounts), "signals": len(signals),
                  "contacts": len(contacts), "drafts": len(drafts), "out": OUT}))
