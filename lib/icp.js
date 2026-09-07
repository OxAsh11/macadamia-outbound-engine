// ICP MATCH FRAMEWORK — derived from Macadamia's product.
// AI agents that execute QA/QC paperwork inside engineering tools, human-reviewed.
// An account enters the PIPELINE only if: Gate A passes AND >=1 Gate-B signal
// with a source URL exists. Everything else = "unqualified" (backstage).

export const GATE_A = {
  // firm type: must produce engineering documentation at volume
  firmType: {
    pass: ["epc", "engineering", "industrial services", "consulting engineering",
           "process", "offshore", "energy", "nuclear", "inspection", "multi-tech"],
    fail: ["residential", "real estate", "facility cleaning", "landscaping"],
  },
  // quality-critical domain boosts (audit trails are regulatory)
  domainCriticality: {
    nuclear: 20, "oil & gas": 18, offshore: 16, process: 14, lng: 18,
    pharma: 14, cleanroom: 14, rail: 10, mining: 10, infrastructure: 8,
  },
};

export const GATE_B = {
  // live evidence the account needs help NOW — each requires a source URL
  signals: {
    project_win:  { weight: 14, label: "Project award — QA doc volume spike incoming", requires: "url" },
    qa_hiring:    { weight: 14, label: "Hiring QA/QC — pain made visible",            requires: "url" },
    quality_event:{ weight: 10, label: "ISO audit / QMS roll-out",                    requires: "url" },
    news_hit:     { weight: 4,  label: "ICP-relevant news mention",                   requires: "url" },
  },
};

export const GATE_C = {
  // reachability — weights, not gates
  namedQualityLead: 10,
  linkedinVerified: 4,
  geography: { Belgium: 16, Netherlands: 14, "UK": 8, France: 8, Germany: 8, Sweden: 6, Denmark: 6, Norway: 6, Spain: 6, Italy: 6, "Czech Republic": 5, Poland: 5, Austria: 6, Switzerland: 6, Portugal: 5, Slovakia: 4 },
  digitalMaturityKeywords: ["autocad", "ansys", "erp", "sap", "power bi", "bim", "iso 19650", "document control"],
  digitalMaturityBonus: 6,
};

// DESIGNATIONS — derived from Macadamia's own words:
// YC launch ask: "engineering leaders in mechanical, civil, and aerospace engineering"
// Reference customer: Proyectos Engineering (small process-design firm, founder-led)
export const DESIGNATIONS = [
  { priority: "P1", role: "Head of Engineering / VP Engineering / Director of Engineering", why: "Their launch ask, verbatim: 'engineering leaders'" },
  { priority: "P1", role: "Founder / Owner (engineer-led firm)", why: "Proyectos archetype — small firms decide at founder level" },
  { priority: "P2", role: "Engineering Operations / Project Engineering Lead", why: "Owns the 'administrative grind' workflow (their core pain phrase)" },
  { priority: "P2", role: "QA/QC Manager / Engineering Quality Lead", why: "Wintercircus: QA/QC is the current product wedge" },
  { priority: "P3", role: "CAD/BIM Manager / VDC Lead", why: "Owns the AutoCAD/Plant 3D/Revit stack Cooper plugs into" },
  { priority: "Champion", role: "Digital / Innovation Lead", why: "AI-curious internal seller (AIinAEC audience profile)" },
];

export function scoreAccount(account, signals = [], contacts = []) {
  const reasons = [];
  const blob = `${account.tier || ""} ${account.sector || ""} ${account.company || ""}`.toLowerCase();

  // GATE A — firm type (pass/fail)
  const aPass = GATE_A.firmType.pass.some(k => blob.includes(k)) &&
                !GATE_A.firmType.fail.some(k => blob.includes(k));
  if (!aPass) {
    return { qualified: false, gateA: false, evidenceSignals: 0, score: 0, reasons: ["Gate A failed: no engineering-documentation profile"], stage: "unqualified" };
  }
  reasons.push("A ✓ engineering-documentation firm");

  // Gate A domain criticality
  let score = 0;
  for (const [dom, pts] of Object.entries(GATE_A.domainCriticality)) {
    if (blob.includes(dom)) { score += pts; reasons.push(`A +${pts} ${dom} (quality-critical domain)`); break; }
  }

  // GATE B — evidence signals (must have URL)
  const evidence = signals.filter(s => s.url && (GATE_B.signals[s.type]));
  if (evidence.length === 0) {
    return { qualified: false, gateA: true, evidenceSignals: 0, score, reasons: [...reasons, "Gate B failed: no evidence-backed signal — parked as unqualified"], stage: "unqualified" };
  }
  for (const s of evidence.slice(0, 4)) {
    const def = GATE_B.signals[s.type];
    score += def.weight;
    reasons.push(`B +${def.weight} ${def.label} (source ✓)`);
  }

  // GATE C — reachability
  const named = contacts.find(c => c.name);
  if (named) { score += GATE_C.namedQualityLead; reasons.push(`C +${GATE_C.namedQualityLead} named contact: ${named.name}`); }
  const geo = GATE_C.geography[account.hq_country];
  if (geo) { score += geo; reasons.push(`C +${geo} geography ${account.hq_country}`); }

  // stage from what exists
  let stage = "signal-verified";
  if (named) stage = "contact-mapped";
  return { qualified: true, gateA: true, evidenceSignals: evidence.length, score: Math.min(score, 100), reasons, stage, contact: named || null };
}

export const KANBAN_STAGES = [
  { id: "unqualified",     label: "Universe — Unqualified", hint: "Gate A ok but no evidence signal yet (backstage)" },
  { id: "signal-verified", label: "Signal-Verified",       hint: "≥1 evidence-backed signal with source URL" },
  { id: "contact-mapped",  label: "Contact-Mapped",        hint: "Named quality/engineering leader identified" },
  { id: "drafting",        label: "Drafting",              hint: "E1 draft grounded to signals" },
  { id: "ready",           label: "Ready to Send",         hint: "Human-reviewed, approved" },
];
