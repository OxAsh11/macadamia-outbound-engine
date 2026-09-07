// Macadamia Outbound Engine — data layer.
// Two modes: Supabase (deployed, live) or bundled snapshot (always works).
import { createClient } from '@supabase/supabase-js';
import snapshot from './snapshot.json';

const SUPABASE_URL = process.env.SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

let supabase = null;
if (SUPABASE_URL && SERVICE_KEY) {
  supabase = createClient(SUPABASE_URL, SERVICE_KEY, { auth: { persistSession: false } });
}

export const mode = supabase ? 'supabase-live' : 'snapshot';

export async function getAccounts() {
  if (supabase) {
    const { data, error } = await supabase.from('accounts').select('*').order('icp_fit_score', { ascending: false });
    if (!error && data) return data;
  }
  return snapshot.accounts;
}

export async function getSignals() {
  if (supabase) {
    const { data, error } = await supabase.from('signals').select('*, accounts(company)').order('discovered_at', { ascending: false });
    if (!error && data) return data.map(s => ({ ...s, company: s.accounts?.company }));
  }
  return snapshot.signals;
}

export async function getContacts() {
  if (supabase) {
    const { data, error } = await supabase.from('contacts').select('*');
    if (!error && data) return data;
  }
  return snapshot.contacts;
}

export async function getDrafts() {
  if (supabase) {
    const { data, error } = await supabase.from('drafts').select('*, accounts(company), contacts(name, linkedin_url)').order('id');
    if (!error && data) return data.map(d => ({ ...d, company: d.accounts?.company, to: d.contacts?.name, to_linkedin: d.contacts?.linkedin_url }));
  }
  return snapshot.drafts;
}

export async function getRuns() {
  if (supabase) {
    const { data, error } = await supabase.from('runs').select('*').order('id', { ascending: false }).limit(20);
    if (!error && data) return data;
  }
  return snapshot.runs || [];
}

export async function getFunnelProjection() {
  return snapshot.funnel_projection;
}
