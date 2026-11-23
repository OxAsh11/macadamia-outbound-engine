# Macadamia Outbound Engine

**An outbound engine that earns its accounts.** It finds engineering firms that need help with QA/QC paperwork right now, proves why with a sourced public signal, and keeps a human in charge of every message.

Live demo: **https://macadamia-outbound-engine.vercel.app**

Built for Macadamia (YC W25), whose AI agents handle QA/QC documentation inside engineering tools. The target buyer is an engineering, procurement and construction (EPC) or process-engineering firm that produces quality documentation at volume.

---

## The idea

Most outbound starts with a bought list and a guess. This engine starts with evidence:

> An account enters the pipeline only if it is the right kind of firm **and** there is at least one public signal, with a source URL, that it needs help now. Everything else is parked, not contacted.

---

## How it works

```
PUBLIC SIGNALS ── project-award news, QA/QC job posts, ISO / quality events
      ▼
GATE A ── Is this an engineering-documentation firm?          (pass / fail)
      │      fails: residential, real estate, cleaning, landscaping
      ▼
GATE B ── At least one signal with a source URL?               (pass / fail)
      │      no evidence → parked as "Unqualified", never contacted
      ▼
GATE C ── Reachability: named quality or engineering lead, geography
      ▼
SCORE ── 0–100, with every point explained in plain words
      ▼
DRAFT ── an agent drafts the first email from the account's own signals
      ▼
REVIEW ── a human approves before anything is sent
```

### Scoring (from `lib/icp.js`)

| Component | Points |
|---|---|
| Quality-critical domain (e.g. nuclear 20, oil & gas 18, LNG 18, offshore 16, process 14, pharma 14) | up to 20 |
| Project award, with source | +14 |
| QA/QC hiring, with source | +14 |
| ISO audit or QMS roll-out, with source | +10 |
| Relevant news mention, with source | +4 |
| Named quality or engineering lead | +10 |
| Geography (Belgium 16, Netherlands 14, UK / France / Germany 8, other European countries 4–6) | up to 16 |

The score is capped at 100. Up to four signals count per account, and a signal without a URL counts for nothing. Every account page shows the reasons behind its score, line by line.

### Pipeline stages

`Unqualified` → `Signal-Verified` → `Contact-Mapped` → `Drafting` → `Ready to Send`

An account moves forward only when the evidence for the next stage exists.

---

## What's in the app

| Page | What it shows |
|---|---|
| `/` | Overview: the engine, the gates and the current pipeline |
| `/pipeline` | Kanban board across the five stages |
| `/accounts` | Every account with its score and stage |
| `/accounts/[company]` | Account profile: gate-by-gate breakdown and a sourced signal timeline |
| `/contacts` | Who to contact and why, by priority role |
| `/signals` | Every signal with its source link |
| `/model` | Funnel projection with low, likely and high bands, computed offline and bundled with the data |
| `/settings` | The full ICP framework, in the open |

### Who it targets

Derived from Macadamia's own launch messaging and reference customers:

| Priority | Role |
|---|---|
| P1 | Head / VP / Director of Engineering |
| P1 | Founder or owner of an engineer-led firm |
| P2 | Engineering operations or project engineering lead |
| P2 | QA/QC manager or engineering quality lead |
| P3 | CAD / BIM manager or VDC lead |
| Champion | Digital or innovation lead |

### The data in the demo

The demo ships with a snapshot (`lib/snapshot.json`, September 2026):

| Item | Count |
|---|---|
| EPC accounts in the universe | 158 |
| Sourced signals | 59 (30 project awards, 26 QA/QC hiring, 3 news) |
| Named contacts | 19 |
| Email drafts | 30, all still waiting for human review |

All data comes from public sources. Nothing was sent from this demo.

---

## Stack

- **Next.js 14** (App Router), deployed on Vercel
- **Supabase** Postgres in live mode, with tables for accounts, signals, contacts, drafts, the discovery queue and runs (`supabase/schema.sql`)
- **Snapshot mode** by default: with no database configured, the app reads `lib/snapshot.json`, so the demo link always works

The signal scanner and the funnel simulation ran in a separate local engine (SQLite, a scheduled scanner and a Streamlit console). Its output is the snapshot in this repo.

---

## Run it locally

```bash
npm install
npm run dev
```

Open http://localhost:3000. It runs in snapshot mode with no setup.

To run against your own database, apply `supabase/schema.sql` and set:

```
SUPABASE_URL=...
SUPABASE_SERVICE_ROLE_KEY=...
```

The Python files in the root (`deploy_*.py`, `fix_*.py`, `make_snapshot.py` and similar) are one-off helpers from the original deployment. You don't need them to run the app.

---

## Data provenance

Public sources only. No confidential information from any employer.

Built by [Ashish Mishra](https://github.com/OxAsh11) in September 2026, as a work sample for Macadamia's Founding GTM Lead role.
