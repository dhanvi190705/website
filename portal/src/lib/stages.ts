import { Stage } from '@prisma/client';

/**
 * The standardized 5-stage pipeline, in order.
 *
 * `accent` is a monotonic single-hue ramp rather than five unrelated colours:
 * the stages are ordered, so colour should encode magnitude (how far along),
 * not identity. Adjacent steps are deliberately close, so every chart using
 * them also carries a direct label — colour is never the only cue.
 */
export const STAGES = [
  {
    id: Stage.IDEATION_SOLUTION_DEFINITION,
    order: 1,
    label: 'Ideation & Solution Definition',
    short: 'Ideation',
    blurb: 'Problem framed, solution shape agreed, success measure defined.',
    accent: '#8A6F1F',
  },
  {
    id: Stage.FEASIBILITY_SCOPING,
    order: 2,
    label: 'Feasibility & Scoping',
    short: 'Feasibility',
    blurb: 'Data, effort and constraints assessed; scope committed.',
    accent: '#BE9A22',
  },
  {
    id: Stage.DEVELOPMENT_INTEGRATION,
    order: 3,
    label: 'Development & Integration',
    short: 'Development',
    blurb: 'The solution is built and wired into the systems it depends on.',
    accent: '#E2B93C',
  },
  {
    id: Stage.TESTING_PILOT_DEPLOYMENT,
    order: 4,
    label: 'Testing & Pilot Deployment',
    short: 'Pilot',
    blurb: 'Accuracy measured against real cases; a pilot group is using it.',
    accent: '#F0D480',
  },
  {
    id: Stage.FULL_ADOPTION_VALUE_REALIZATION,
    order: 5,
    label: 'Full Adoption & Value Realization',
    short: 'Adoption',
    blurb: 'In routine use, with the value it was built for being measured.',
    accent: '#FBF0C6',
  },
] as const;

export type StageMeta = (typeof STAGES)[number];

export const STAGE_IDS = STAGES.map((s) => s.id);

export function stageMeta(stage: Stage): StageMeta {
  return STAGES.find((s) => s.id === stage) ?? STAGES[0];
}

export function stageIndex(stage: Stage): number {
  const found = STAGES.findIndex((s) => s.id === stage);
  return found === -1 ? 0 : found;
}

/** Percentage of the pipeline completed, counting the current stage as done. */
export function stageProgress(stage: Stage): number {
  return Math.round(((stageIndex(stage) + 1) / STAGES.length) * 100);
}

export function isStage(value: unknown): value is Stage {
  return typeof value === 'string' && (STAGE_IDS as readonly string[]).includes(value);
}
