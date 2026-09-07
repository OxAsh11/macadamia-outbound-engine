// v2 data layer: snapshot + ICP framework applied in one place
import { scoreAccount } from "./icp";
import { createClient } from "@supabase/supabase-js";
import snapshot from "./snapshot.json";

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
let supabase = null;
if (SUPABASE_URL && SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}
export const mode = supabase ? "supabase-live" : "snapshot";

const sig = (arr) => (arr || []).map(s => ({ ...s, discovered_at: s.discovered_at || null }));

export async function getEnrichedAccounts() {
  let accounts, signals, contacts, drafts, runs, funnel;
  if (supabase) {
    const [a, s, c, d, r] = await Promise.all([
      supabase.from("accounts").select("*"),
      supabase.from("signals").select("*"),
      supabase.from("contacts").select("*"),
      supabase.from("drafts").select("*"),
      supabase.from("runs").select("*").limit(20),
    ]);
    accounts = a.data; signals = s.data; contacts = c.data; drafts = d.data; runs = r.data;
    funnel = snapshot.funnel_projection;
  } else {
    accounts = snapshot.accounts; signals = snapshot.signals;
    contacts = snapshot.contacts; drafts = snapshot.drafts;
    runs = snapshot.runs; funnel = snapshot.funnel_projection;
  }
  signals = sig(signals);

  const byAccount = {};
  signals.forEach(s => { (byAccount[s.account_id] ||= []).push(s); });
  const contactsByAccount = {};
  contacts.forEach(c => { (contactsByAccount[c.account_id] ||= []).push(c); });
  const draftsByAccount = {};
  drafts.forEach(d => { if (d.status !== "KILLED") (draftsByAccount[d.account_id] ||= []).push(d); });

  const enriched = accounts.map(a => {
    const asigs = byAccount[a.id] || [];
    const acons = contactsByAccount[a.id] || [];
    const result = scoreAccount(a, asigs, acons);
    const hasDraft = (draftsByAccount[a.id] || []).length > 0;
    const approved = (draftsByAccount[a.id] || []).some(d => ["APPROVED", "SENT", "REPLIED", "MEETING"].includes(d.status));
    let stage = result.stage;
    if (result.qualified && approved) stage = "ready";
    else if (result.qualified && hasDraft) stage = "drafting";
    return {
      ...a, signals: asigs, contacts: acons, drafts: draftsByAccount[a.id] || [],
      icp: result, stage,
    };
  });

  return { accounts: enriched, runs, funnel, mode };
}
