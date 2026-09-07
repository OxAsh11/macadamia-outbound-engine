# 🥜 Macadamia Outbound Engine

EPC account-discovery engine + CRM built as the work-sample for Macadamia's
Founding GTM Lead role (YC W25, AI agents for EPC QA/QC paperwork).

## What it does
1. **Signal engine** — daily scan of public sources (project-award news, QA/QC
   vacancy posts) matched against a 159-account EPC universe; new matching
   companies enter a discovery queue.
2. **Evidence-anchored ICP scoring** — score = proof: verified project win +12,
   live QA/QC hiring +12, named quality lead +8, Benelux walk-in +15.
3. **CRM** — accounts, signals, contacts, drafts, runs; review gate on every
   outbound draft (agents draft, humans judge).
4. **Measurement** — 10,000-run Monte Carlo funnel (P10/P50/P90); live sends
   tracked against model bands.

## Stack
- Next.js 14 (this app) — deployed to Vercel
- Supabase Postgres in live mode (`supabase/schema.sql`); bundled snapshot
  fallback so the demo link never breaks
- Local engine (SQLite + Streamlit + cron scanner) in `../macadamia-application/engine`

## Env
SUPABASE_URL= / SUPABASE_SERVICE_ROLE_KEY= (optional — snapshot mode without)

## Data provenance
100% public sources. No confidential information from any employer.
Built by Ashish Mishra, Sep 2026.
