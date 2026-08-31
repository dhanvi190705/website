/**
 * Server-side seed dataset.
 *
 * Used two ways: by `prisma/seed.js` to populate PostgreSQL, and directly by the
 * service layer when DATABASE_URL is unset — so the API is runnable before a
 * database exists and every endpoint returns the shape the SPA expects.
 */
import { champions, departments, projects as rawProjects } from './programme.js';

export { champions, departments };

/**
 * Project records carry `updatedDaysAgo` rather than a fixed date, so seeded
 * data and seed-mode API responses stay current whenever they are generated.
 */
export const projects = rawProjects.map(({ updatedDaysAgo, ...project }) => ({
  ...project,
  updatedDaysAgo,
  updatedAt: new Date(Date.now() - updatedDaysAgo * 86_400_000).toISOString().slice(0, 10),
}));

export const PROGRAMME_START = '2025-09-01';
export const NEWSLETTER_INTERVAL_DAYS = 15;

export const STAGE_ORDER = ['ideation', 'poc', 'validation', 'production', 'scaling'];

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
    size: 412337,
  },
];

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

export const documents = [
  {
    slug: 'ai-playbook',
    kicker: 'Document 01',
    title: 'AI Playbook',
    body: 'How to build with AI here — programme structure, champion roles, the project pipeline, the training curriculum, governance and the launch plan.',
    meta: 'PDF · 24 pages · For every employee',
    href: '/docs/AI-NEXT-Playbook.pdf',
    category: 'document',
    order: 1,
  },
  {
    slug: 'ai-governance-policy',
    kicker: 'Document 02',
    title: 'AI Governance Policy',
    body: 'The rules of use — data classification, what may and may not be shared with external models, approval paths, and accountability for AI-assisted output.',
    meta: 'PDF · 16 pages · Mandatory reading',
    href: '/docs/AI-NEXT-Governance-Policy.pdf',
    category: 'document',
    order: 2,
  },
];

export const reviewFlags = [
  { id: 'rq-1', projectIndex: 0, reason: 'Stage advance to Validation awaiting sign-off', age: 3, severity: 'high' },
  { id: 'rq-2', projectIndex: 3, reason: 'Proof of accuracy not attached for 14 days', age: 14, severity: 'high' },
  { id: 'rq-3', projectIndex: 7, reason: 'Data classification confirmation outstanding', age: 6, severity: 'medium' },
  { id: 'rq-4', projectIndex: 11, reason: 'No reflection logged since last demo day', age: 9, severity: 'medium' },
  { id: 'rq-5', projectIndex: 15, reason: 'Production rollout plan pending owner assignment', age: 2, severity: 'low' },
];

/** Keyword FAQ base backing /api/assistant when no model key is configured. */
export const knowledgeBase = [
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
];

export const assistantFallback =
  'I can help with programme policy, project stages, proof and evidence standards, the newsletter cadence and Batch 01 privileges. Ask about any of those, or open the **Resource & Policy Vault** for the full Playbook and Governance Policy.';
