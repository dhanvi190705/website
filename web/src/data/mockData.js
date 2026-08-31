import { champions, departments, projects as rawProjects } from './programme';

export { champions, departments };

/**
 * Project records carry `updatedDaysAgo` rather than a fixed date, so "last
 * moved 3 days ago" stays true whenever the app runs instead of drifting into
 * a dataset that reads as months stale.
 */
export const projects = rawProjects.map(({ updatedDaysAgo, ...project }) => ({
  ...project,
  updatedAt: new Date(Date.now() - updatedDaysAgo * 86_400_000).toISOString().slice(0, 10),
}));

/* ------------------------------------------------------------------ *
 * Programme constants
 * ------------------------------------------------------------------ */

export const PROGRAMME_START = '2025-09-01'; // Batch 01 kickoff — anchors the newsletter cadence.
export const NEWSLETTER_INTERVAL_DAYS = 15;

/**
 * The champion pipeline, in order. Everything stage-aware reads from here.
 *
 * `accent` is a monotonic single-hue gold ramp rather than five arbitrary hues:
 * the stages are ordered, so magnitude — not identity — is what colour should
 * encode. Adjacent steps are close by design, so every chart that uses them also
 * carries a direct label and a 2px gap; colour is never the only cue.
 */
export const STAGES = [
  {
    id: 'ideation',
    label: 'Ideation',
    short: 'Ideate',
    blurb: 'Problem framed, stakeholders aligned, success measure agreed.',
    accent: '#8A6F1F',
  },
  {
    id: 'poc',
    label: 'Proof of Concept',
    short: 'PoC',
    blurb: 'A rough build that proves the idea can work on real data.',
    accent: '#BE9A22',
  },
  {
    id: 'validation',
    label: 'Validation',
    short: 'Validate',
    blurb: 'Accuracy measured against ground truth, users trialling output.',
    accent: '#E2B93C',
  },
  {
    id: 'production',
    label: 'Production',
    short: 'Ship',
    blurb: 'Live in the department workflow with an owner and a support path.',
    accent: '#F0D480',
  },
  {
    id: 'scaling',
    label: 'Scaling',
    short: 'Scale',
    blurb: 'Rolled beyond the first team — measured, governed, repeatable.',
    accent: '#FBF0C6',
  },
];

export const stageIndex = (id) => Math.max(0, STAGES.findIndex((s) => s.id === id));
export const stageById = (id) => STAGES.find((s) => s.id === id) || STAGES[0];

/* ------------------------------------------------------------------ *
 * Section 1 — Pioneer Vision
 * ------------------------------------------------------------------ */

export const visionStatement =
  'AI NEXT exists to put capability, not just curiosity, in the hands of every team. ' +
  'Batch 01 is the proving ground: forty-three people who stopped waiting for a vendor ' +
  'and started shipping the tools their own departments needed.';

/** The milestone path — how AI NEXT started and where Batch 01 is headed. */
export const timeline = [
  {
    id: 'm-foundation',
    period: 'June 2025',
    title: 'Foundation',
    highlight: 'Foundation',
    body: 'The case for an in-house AI capability is made. Six training batches are planned around real departmental problems rather than generic tooling.',
    stat: { value: '186', label: 'people trained' },
    status: 'complete',
  },
  {
    id: 'm-selection',
    period: 'August 2025',
    title: 'Champion Selection',
    highlight: 'Selection',
    body: 'Sixty candidates are assessed on logical thinking, troubleshooting, thoroughness, applying context and scalability. Forty-three become Batch 01.',
    stat: { value: '43', label: 'champions & specialists' },
    status: 'complete',
  },
  {
    id: 'm-launch',
    period: 'September 2025',
    title: 'Project Launch',
    highlight: 'Launch',
    body: 'Champion pairs take ownership of allocated projects across nineteen departments. Every project gets a named owner and a measurable outcome.',
    stat: { value: '39', label: 'projects opened' },
    status: 'complete',
  },
  {
    id: 'm-design',
    period: 'October 2025',
    title: 'Data & Solution Design',
    highlight: 'Design',
    body: 'Champions gather the data their project actually needs, then design the solution around it. The AI Lab opens for hands-on build sessions.',
    stat: { value: '19', label: 'departments building' },
    status: 'complete',
  },
  {
    id: 'm-poc',
    period: 'Mid-November 2025',
    title: 'Model Development & Testing',
    highlight: 'Testing',
    body: 'Proof of concepts are built through deliberate trial and error, with fortnightly demo days keeping the work visible across the business.',
    stat: { value: '21', label: 'PoCs in flight' },
    status: 'active',
  },
  {
    id: 'm-validation',
    period: 'End November 2025',
    title: 'Deployment & Validation',
    highlight: 'Validation',
    body: 'Solutions go into real use and champions measure the accuracy of what they produce against the workflow they replaced.',
    stat: { value: '8', label: 'live in production' },
    status: 'upcoming',
  },
  {
    id: 'm-recognition',
    period: 'December 2025',
    title: 'Rewards & Recognition',
    highlight: 'Recognition',
    body: 'Top-performing champion pairs are recognised, and Batch 02 selection opens with Batch 01 champions as the mentors.',
    stat: { value: 'Batch 02', label: 'intake opens' },
    status: 'upcoming',
  },
];

/** Privileges that only ever apply to the inaugural cohort. */
export const pioneerPrivileges = [
  {
    id: 'p-founding',
    title: 'Founding Champion Mark',
    body: 'A permanent Batch 01 designation on your profile, carried into every future cohort of the programme.',
    icon: 'Crown',
  },
  {
    id: 'p-lab',
    title: 'Priority AI Lab Access',
    body: 'First call on lab time, model credits and the AI Specialist bench for unblocking a stuck build.',
    icon: 'FlaskConical',
  },
  {
    id: 'p-voice',
    title: 'Policy Drafting Voice',
    body: 'Batch 01 feedback is folded directly into the governance policy before it becomes mandatory reading.',
    icon: 'Gavel',
  },
  {
    id: 'p-mentor',
    title: 'Batch 02 Mentorship',
    body: 'Lead a pair in the next intake and shape how the second generation of champions is trained.',
    icon: 'Users',
  },
  {
    id: 'p-demo',
    title: 'Demo Day Platform',
    body: 'A standing slot to present your build to the leadership team at the fortnightly demo day.',
    icon: 'Presentation',
  },
  {
    id: 'p-learning',
    title: 'Continued Learning Budget',
    body: 'Ongoing access to external speakers, AI Fridays and advanced curriculum beyond the core programme.',
    icon: 'GraduationCap',
  },
];

/* ------------------------------------------------------------------ *
 * Section 2 — Champion Workspace
 * ------------------------------------------------------------------ */

/** The signed-in champion. Swap for the authenticated user once auth lands. */
export const currentUser = {
  id: 'saloni-babel',
  name: 'Saloni Babel',
  initials: 'SB',
  deptCode: 'P&S',
  role: 'champion',
  badge: 'First Batch Champion',
  batch: 'Batch 01',
  projectId: 'p&s-smart-ai-assistant-project-monitor-1',
  joinedAt: '2025-08-14',
};

export const PROOF_KINDS = [
  { id: 'link', label: 'Live link', hint: 'Deployed tool, dashboard or demo URL' },
  { id: 'repo', label: 'Code repo', hint: 'Git remote or shared drive folder' },
  { id: 'screenshot', label: 'Screenshot', hint: 'PNG or JPG of the working output' },
  { id: 'document', label: 'Document', hint: 'Spec, test results or accuracy report' },
];

/** Seed proofs already attached to the signed-in champion's project. */
export const seedProofs = [
  {
    id: 'proof-1',
    kind: 'repo',
    name: 'smart-assistant-service',
    detail: 'git@internal:planning/smart-assistant-service.git',
    addedAt: '2025-11-04',
    size: null,
  },
  {
    id: 'proof-2',
    kind: 'screenshot',
    name: 'weekly-rollup-accuracy.png',
    detail: 'Accuracy run against 6 weeks of manual reports',
    addedAt: '2025-11-12',
    size: 412_337,
  },
];

/** Reflection log history — newest first. */
export const seedReflections = [
  {
    id: 'r-1',
    createdAt: '2025-11-12',
    stage: 'poc',
    wins: 'The assistant now pulls **site progress** and schedule slip into one weekly rollup without anyone re-keying it. Saved roughly 6 hours across the planning team last week.',
    blockers: 'Two site teams still submit progress as scanned PDFs, so extraction accuracy sits around 71%. Need a standard template before this can be trusted end to end.',
    learnings: 'Constraining the model to a fixed output schema removed almost all of the hallucinated dates. Structure beats prompt length.',
  },
  {
    id: 'r-2',
    createdAt: '2025-10-28',
    stage: 'poc',
    wins: 'First end-to-end run completed on real October data. Output matched the manual report on 4 of 5 sections.',
    blockers: 'Waiting on read access to the scheduling database — currently working from weekly exports.',
    learnings: 'Starting from the report that already exists made the scope obvious. Do not design a new artefact when you can automate the one people already read.',
  },
];

/* ------------------------------------------------------------------ *
 * Section 3 — Resource & Policy Vault
 * ------------------------------------------------------------------ */

/** Static, always-available documents. Files live in web/public/docs. */
export const vaultDocuments = [
  {
    id: 'doc-playbook',
    kicker: 'Document 01',
    title: 'AI Playbook',
    body: 'How to build with AI here — programme structure, champion roles, the project pipeline, the training curriculum, governance and the launch plan.',
    meta: 'PDF · 24 pages · For every employee',
    href: '/docs/AI-NEXT-Playbook.pdf',
    filename: 'AI-NEXT-Playbook.pdf',
    icon: 'BookOpen',
  },
  {
    id: 'doc-governance',
    kicker: 'Document 02',
    title: 'AI Governance Policy',
    body: 'The rules of use — data classification, what may and may not be shared with external models, approval paths, and accountability for AI-assisted output.',
    meta: 'PDF · 16 pages · Mandatory reading',
    href: '/docs/AI-NEXT-Governance-Policy.pdf',
    filename: 'AI-NEXT-Governance-Policy.pdf',
    icon: 'ShieldCheck',
  },
];

/** Government / regulatory frameworks champions must build within. */
export const policyFrameworks = [
  {
    id: 'pf-niti',
    title: 'National Strategy for Artificial Intelligence',
    issuer: 'NITI Aayog',
    year: '2018',
    body: 'The founding national position on AI for inclusive growth — sector priorities, research architecture and the "AI for All" framing.',
    href: 'https://www.niti.gov.in/sites/default/files/2023-03/National-Strategy-for-Artificial-Intelligence.pdf',
  },
  {
    id: 'pf-raise',
    title: 'Responsible AI for All — Principles',
    issuer: 'NITI Aayog',
    year: '2021',
    body: 'The seven principles for responsible AI: safety, equality, inclusivity, privacy, transparency, accountability and protection of human values.',
    href: 'https://www.niti.gov.in/sites/default/files/2021-02/Responsible-AI-22022021.pdf',
  },
  {
    id: 'pf-dpdp',
    title: 'Digital Personal Data Protection Act',
    issuer: 'Ministry of Electronics & IT',
    year: '2023',
    body: 'Consent, purpose limitation and breach obligations for personal data — the binding constraint on any champion project touching customer records.',
    href: 'https://www.meity.gov.in/data-protection-framework',
  },
  {
    id: 'pf-indiaai',
    title: 'IndiaAI Mission Framework',
    issuer: 'Government of India',
    year: '2024',
    body: 'Compute access, datasets, safe & trusted AI pillars and the application development initiative shaping national AI infrastructure.',
    href: 'https://indiaai.gov.in/',
  },
];

/**
 * Editorial notes for newsletter issues. Issues themselves are generated on a
 * rolling 15-day cadence from PROGRAMME_START, so the hub keeps updating itself
 * without anyone editing this file. Notes are matched to issue number.
 */
export const newsletterNotes = {
  1: {
    headline: 'Batch 01 begins',
    lede: 'Forty-three champions take ownership of thirty-nine projects across nineteen departments.',
    tags: ['Kickoff', 'Roster', 'Project allocation'],
  },
  2: {
    headline: 'Finding the data',
    lede: 'What champions discovered when they went looking for the data their projects assumed existed.',
    tags: ['Data collection', 'Marketing', 'Finance'],
  },
  3: {
    headline: 'First builds land',
    lede: 'Estimation and Engineering demo the first working prototypes at the opening demo day.',
    tags: ['Demo day', 'Estimation', 'Engineering'],
  },
  4: {
    headline: 'Governance, in practice',
    lede: 'The classification rules champions actually hit, and how the approval path resolved them.',
    tags: ['Policy', 'Legal', 'Approvals'],
  },
  5: {
    headline: 'Accuracy over ambition',
    lede: 'Three teams cut scope to raise accuracy — and shipped sooner for it.',
    tags: ['Validation', 'HR', 'CRM'],
  },
  6: {
    headline: 'Into production',
    lede: 'The first champion tools enter daily departmental use with named owners and support paths.',
    tags: ['Production', 'Billing', 'Operations'],
  },
};

/* ------------------------------------------------------------------ *
 * Section 4 — Executive Dashboard
 * ------------------------------------------------------------------ */

export const reviewQueue = [
  { id: 'rq-1', projectId: projects[0]?.id, reason: 'Stage advance to Validation awaiting sign-off', age: 3, severity: 'high' },
  { id: 'rq-2', projectId: projects[3]?.id, reason: 'Proof of accuracy not attached for 14 days', age: 14, severity: 'high' },
  { id: 'rq-3', projectId: projects[7]?.id, reason: 'Data classification confirmation outstanding', age: 6, severity: 'medium' },
  { id: 'rq-4', projectId: projects[11]?.id, reason: 'No reflection logged since last demo day', age: 9, severity: 'medium' },
  { id: 'rq-5', projectId: projects[15]?.id, reason: 'Production rollout plan pending owner assignment', age: 2, severity: 'low' },
];

/* ------------------------------------------------------------------ *
 * Section 5 — AI Support Widget
 * ------------------------------------------------------------------ */

export const assistantSuggestions = [
  'What can I share with an external model?',
  'How do I move my project to Validation?',
  'When is the next newsletter?',
  'What counts as valid proof?',
  'What do Batch 01 champions get?',
];

/**
 * Deterministic FAQ knowledge base. The widget matches on keywords locally so
 * the panel is fully functional with no API key; wire `/api/assistant` in
 * lib/api.js to swap in a real model.
 */
export const assistantKnowledge = [
  {
    id: 'kb-sharing',
    keywords: ['share', 'external', 'chatgpt', 'confidential', 'data', 'classification', 'upload'],
    answer:
      'Data classification decides it. **Public** and **Internal** material can go to approved external models. **Confidential** material — customer records, pricing, unpublished financials, employee data — must stay on approved internal tooling. If you are unsure, treat it as Confidential and raise it through the approval path in the Governance Policy (Section 4).',
    sources: ['AI Governance Policy · §3 Data Classification'],
  },
  {
    id: 'kb-stage',
    keywords: ['stage', 'advance', 'validation', 'promote', 'move', 'progress', 'next'],
    answer:
      'Set the new stage in **Champion Workspace**, attach at least one proof for the stage you are leaving, and log a reflection covering wins, blockers and learnings. Submitting flags the project for review; your AI Specialist confirms the advance, usually within two working days.',
    sources: ['AI Playbook · Project pipeline'],
  },
  {
    id: 'kb-proof',
    keywords: ['proof', 'evidence', 'upload', 'screenshot', 'repo', 'link', 'attach'],
    answer:
      'Valid proof is anything a reviewer can open and check: a live link to the working tool, a code repository, a screenshot of real output, or an accuracy report. Mock-ups and slides do not count on their own — the point is to show the thing running on real data.',
    sources: ['AI Playbook · Evidence standards'],
  },
  {
    id: 'kb-newsletter',
    keywords: ['newsletter', 'issue', 'fortnightly', 'bi-weekly', 'when', 'publish'],
    answer:
      'The newsletter is fortnightly — a new issue every 15 days from the 1 September programme start. Every issue is listed in the **Resource & Policy Vault**, with the current one marked live and the next one showing its scheduled date.',
    sources: ['Resource & Policy Vault'],
  },
  {
    id: 'kb-privileges',
    keywords: ['batch 01', 'pioneer', 'privilege', 'benefit', 'perk', 'champion', 'first batch'],
    answer:
      'Batch 01 carries a permanent founding-champion mark, priority AI Lab and specialist access, a drafting voice on the governance policy, a Batch 02 mentorship slot, a standing demo-day platform, and a continued learning budget. These do not transfer to later cohorts.',
    sources: ['Pioneer Vision · Privileges'],
  },
  {
    id: 'kb-policy',
    keywords: ['policy', 'government', 'framework', 'niti', 'dpdp', 'regulation', 'compliance', 'law'],
    answer:
      'The vault carries the four frameworks your project must sit inside: the **NITI Aayog National Strategy for AI**, the **Responsible AI for All** principles, the **DPDP Act 2023** for anything touching personal data, and the **IndiaAI Mission** framework. The internal Governance Policy translates these into our approval paths.',
    sources: ['Resource & Policy Vault · Policy frameworks'],
  },
  {
    id: 'kb-reflection',
    keywords: ['reflection', 'log', 'wins', 'blockers', 'learnings', 'markdown', 'write'],
    answer:
      'The reflection log takes Markdown — `**bold**`, `*italic*`, `` `code` ``, `- bullets` and `# headings` all render. Keep the three parts honest: what moved, what is stuck, and what you would tell the next champion. Blockers logged early are what get a specialist assigned to you.',
    sources: ['Champion Workspace · Reflection log'],
  },
  {
    id: 'kb-help',
    keywords: ['help', 'stuck', 'specialist', 'support', 'lab', 'contact', 'who'],
    answer:
      'Log the blocker in your reflection first — that is what routes a specialist to you. For anything urgent, the AI Lab runs open hours on AI Fridays, and there are nine AI Specialists across the departments listed in the Executive Dashboard.',
    sources: ['AI Playbook · Support model'],
  },
];

export const assistantFallback =
  'I can help with programme policy, project stages, proof and evidence standards, the newsletter cadence and Batch 01 privileges. Ask about any of those, or open the **Resource & Policy Vault** for the full Playbook and Governance Policy.';
