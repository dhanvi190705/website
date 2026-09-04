/**
 * PLACEHOLDER EDITORIAL CONTENT.
 *
 * Everything in this file is written to be replaced. It is deliberately kept
 * out of the database so the portal renders sensibly on an empty deployment,
 * and deliberately in one module so swapping it for real copy is a single
 * file change rather than a hunt through components.
 */

export const aboutSections = [
  {
    id: 'overview',
    kicker: 'Overview',
    title: 'What AI.Next is for',
    body: [
      'AI.Next is the operating layer for artificial intelligence across the business — one place where every initiative is visible, supported and measured against the value it was meant to deliver.',
      'It exists because AI work tends to scatter: a promising experiment in one department never reaches the team with the same problem, and nobody can answer the simple question of how much is actually running. The portal makes the whole portfolio legible in one view.',
    ],
    points: [
      'Every initiative tracked against one standardized pipeline, so progress means the same thing everywhere.',
      'Proof of work attached to each stage, so claims of progress are backed by something a reviewer can open.',
      'Governance and policy available at the point of work rather than in an inbox.',
    ],
  },
  {
    id: 'origin',
    kicker: 'Origin Story',
    title: 'How AI.Next started',
    body: [
      'The programme began with a training cohort rather than a platform. Teams across the business were taught to build with AI against problems they already owned, and the constraint was deliberate: no generic tooling exercises, only work that would matter if it shipped.',
      'What that surfaced was a coordination problem more than a capability one. People could build. What they lacked was a shared definition of progress, a route to governance answers, and any way for leadership to see the portfolio without asking each department in turn.',
      'AI.Next is the response — the programme, given a spine.',
    ],
    points: [],
  },
  {
    id: 'agenda',
    kicker: 'Agenda & Expectations',
    title: 'What participants are asked for',
    body: [
      'Champions own an initiative end to end and are expected to keep its status honest — including when it is stuck. A blocker recorded early is what gets specialist help assigned; a blocker discovered at review is a missed quarter.',
      'The AI / Tech Team owns the platform, the governance rules and the support model, and is accountable for unblocking champions rather than auditing them.',
    ],
    points: [
      'Move your project through the five stages as reality changes — not at reporting time.',
      'Attach evidence at each stage: a working link, a repository, a screenshot of real output, or a measured result.',
      'Read published circulars and act on the items addressed to you.',
      'Raise governance questions before sharing data, not after.',
    ],
  },
] as const;

export const resourceItems = [
  {
    id: 'newsletter',
    kicker: 'Published fortnightly',
    title: 'AI.Next Newsletter',
    description:
      'A round-up of what each business unit is building — initiatives that changed stage, evidence worth copying, and what lands next fortnight.',
    meta: 'Placeholder — supply the current issue',
    body: [
      'This is placeholder content. Replace it with the current newsletter issue, or point this card at wherever issues are published.',
      'Until then it stands in so the Resources Hub renders complete on an empty deployment.',
    ],
  },
  {
    id: 'governance',
    kicker: 'Mandatory reading',
    title: 'AI Governance Policy',
    description:
      'The rules of use — data classification, what may and may not be shared with external models, approval paths, and accountability for AI-assisted output.',
    meta: 'Placeholder — supply the approved policy',
    body: [
      'Placeholder summary of the governance position:',
      'Data is classified Public, Internal or Confidential. Public and Internal material may be used with approved external models. Confidential material — customer records, pricing, unpublished financials, employee data — stays on approved internal tooling.',
      'Where a champion is unsure, the material is treated as Confidential and the question is raised with the AI / Tech Team before anything is shared.',
      'Output produced with AI assistance carries the same accountability as output produced without it. The person who ships it owns it.',
    ],
  },
  {
    id: 'playbook',
    kicker: 'For every participant',
    title: 'AI Playbook',
    description:
      'How to run an initiative here — the five stages, what evidence each one expects, the support model, and how work is reviewed.',
    meta: 'Placeholder — supply the approved playbook',
    body: [
      'Placeholder summary of the playbook:',
      'Start from a process that already exists and is already read. Automating a report people rely on beats designing a new artefact nobody asked for.',
      'Prove the idea on real data before scaling the build. A pilot on genuine cases tells you more than a polished prototype on synthetic ones.',
      'Record accuracy against the manual process being replaced — that comparison is what makes adoption arguable.',
    ],
  },
] as const;

/**
 * Grounding passages for the AI assistant. The route retrieves the closest
 * match and hands it to the model as the only source it may answer from.
 */
export const knowledgeBase = [
  {
    id: 'kb-classification',
    topic: 'Data classification and external models',
    keywords: ['share', 'external', 'chatgpt', 'confidential', 'classification', 'upload', 'data'],
    passage:
      'Data classification decides what may be shared. Public and Internal material may be used with approved external models. Confidential material — customer records, pricing, unpublished financials and employee data — must stay on approved internal tooling. When a champion is unsure, the material is treated as Confidential and the question is raised with the AI / Tech Team before anything is shared.',
    source: 'AI Governance Policy · Data classification',
  },
  {
    id: 'kb-stages',
    topic: 'The five-stage pipeline',
    keywords: ['stage', 'pipeline', 'advance', 'progress', 'move', 'next', 'ideation', 'feasibility', 'pilot', 'adoption'],
    passage:
      'Every initiative runs through five standardized stages: Ideation & Solution Definition, Feasibility & Scoping, Development & Integration, Testing & Pilot Deployment, and Full Adoption & Value Realization. A champion changes the stage in Project Tracker and records a note describing what actually moved. Stage changes are expected as reality changes, not saved up for reporting time.',
    source: 'AI Playbook · Project pipeline',
  },
  {
    id: 'kb-evidence',
    topic: 'Evidence and proof of work',
    keywords: ['evidence', 'proof', 'upload', 'attach', 'screenshot', 'link', 'file'],
    passage:
      'Evidence is anything a reviewer can open and check: a live link to the working tool, a repository, a screenshot of real output, or a measured accuracy result. Mock-ups and slide decks do not count on their own — the point is to show the work running against real cases. Evidence is attached in Project Tracker against the stage it belongs to.',
    source: 'AI Playbook · Evidence standards',
  },
  {
    id: 'kb-roles',
    topic: 'Roles and permissions',
    keywords: ['role', 'permission', 'champion', 'tech team', 'admin', 'access', 'who'],
    passage:
      'There are two roles. AI Champions are mapped to a business unit and manage the initiatives assigned to them — updating stage, recording notes and attaching evidence — and read published announcements. The AI / Tech Team holds administrative access: creating accounts and business units, creating and assigning projects, publishing announcements, and viewing the executive dashboard across every initiative.',
    source: 'AI.Next Portal · Access model',
  },
  {
    id: 'kb-announcements',
    topic: 'Announcements and circulars',
    keywords: ['announcement', 'circular', 'intimation', 'update', 'notice', 'publish'],
    passage:
      'Official intimations, circulars and action items are published by the AI / Tech Team and appear under Announcements. Champions have read-only access. Pinned items stay at the top of the list because they carry an action or a deadline.',
    source: 'AI.Next Portal · Publishing',
  },
  {
    id: 'kb-support',
    topic: 'Getting help',
    keywords: ['help', 'stuck', 'blocker', 'support', 'contact', 'assistance'],
    passage:
      'Record the blocker in the note on your next stage update — that is what routes support to you. The AI / Tech Team monitors the executive dashboard for initiatives that have not moved and for stages where work is bunching, and reaches out on that basis. Governance questions should be raised before data is shared, not after.',
    source: 'AI Playbook · Support model',
  },
] as const;

export const assistantFallback =
  'I can answer questions about data classification and governance, the five-stage pipeline, what counts as evidence, roles and permissions, announcements, and how to get help. Ask about any of those — or open the Resources Hub for the full Governance Policy and Playbook.';
