import { Stage } from '@prisma/client';
import { STAGES, stageIndex, stageProgress } from './stages';
import { daysSince } from './utils';

export type ProjectRow = {
  id: string;
  name: string;
  stage: Stage;
  businessUnitName: string;
  championName: string | null;
  updatedAt: string;
  updateCount: number;
  evidenceCount: number;
};

/** How long a project may sit untouched before it counts as stalled. */
export const STALL_DAYS = 21;

export function portfolioSummary(projects: ProjectRow[]) {
  const total = projects.length;
  const averageProgress = total
    ? Math.round(projects.reduce((sum, p) => sum + stageProgress(p.stage), 0) / total)
    : 0;

  return {
    total,
    averageProgress,
    inAdoption: projects.filter((p) => stageIndex(p.stage) === STAGES.length - 1).length,
    stalled: projects.filter((p) => daysSince(p.updatedAt) >= STALL_DAYS).length,
    noEvidence: projects.filter((p) => p.evidenceCount === 0).length,
    businessUnits: new Set(projects.map((p) => p.businessUnitName)).size,
    unassigned: projects.filter((p) => !p.championName).length,
  };
}

export type StageSlice = {
  id: Stage;
  label: string;
  short: string;
  accent: string;
  count: number;
  share: number;
};

export function stageDistribution(projects: ProjectRow[]): StageSlice[] {
  const total = projects.length || 1;
  return STAGES.map((stage) => {
    const count = projects.filter((p) => p.stage === stage.id).length;
    return {
      id: stage.id,
      label: stage.label,
      short: stage.short,
      accent: stage.accent,
      count,
      share: Math.round((count / total) * 100),
    };
  });
}

/**
 * Bottlenecks, ranked by how much they should worry someone.
 *
 * Three separate signals rather than one blended score, because the remedy
 * differs: a stalled project needs a conversation, a stage holding a third of
 * the portfolio needs a process fix, and an unassigned project needs an owner.
 */
export function bottlenecks(projects: ProjectRow[]) {
  const total = projects.length;
  const distribution = stageDistribution(projects);

  const findings: Array<{
    id: string;
    severity: 'high' | 'medium' | 'low';
    title: string;
    detail: string;
  }> = [];

  for (const slice of distribution) {
    // A stage holding a third or more of everything is where work is piling up.
    if (total >= 3 && slice.share >= 34) {
      findings.push({
        id: `pileup-${slice.id}`,
        severity: slice.share >= 50 ? 'high' : 'medium',
        title: `${slice.count} of ${total} projects sitting at ${slice.short}`,
        detail: `${slice.share}% of the portfolio is at "${slice.label}". Work is bunching here — check whether the next stage has a shared blocker.`,
      });
    }
  }

  const stalled = projects.filter((p) => daysSince(p.updatedAt) >= STALL_DAYS);
  if (stalled.length) {
    findings.push({
      id: 'stalled',
      severity: stalled.length > total / 3 ? 'high' : 'medium',
      title: `${stalled.length} project${stalled.length === 1 ? '' : 's'} untouched for ${STALL_DAYS}+ days`,
      detail: `Longest silent: ${stalled
        .slice()
        .sort((a, b) => daysSince(b.updatedAt) - daysSince(a.updatedAt))
        .slice(0, 3)
        .map((p) => `${p.name} (${daysSince(p.updatedAt)}d)`)
        .join(', ')}.`,
    });
  }

  const noEvidence = projects.filter((p) => p.evidenceCount === 0 && stageIndex(p.stage) > 0);
  if (noEvidence.length) {
    findings.push({
      id: 'no-evidence',
      severity: 'medium',
      title: `${noEvidence.length} project${noEvidence.length === 1 ? '' : 's'} past Ideation with no evidence`,
      detail: 'Stage progress is being claimed without anything a reviewer can open and check.',
    });
  }

  const unassigned = projects.filter((p) => !p.championName);
  if (unassigned.length) {
    findings.push({
      id: 'unassigned',
      severity: 'low',
      title: `${unassigned.length} project${unassigned.length === 1 ? '' : 's'} without a champion`,
      detail: 'Nobody owns day-to-day progress on these. Assign a champion from the Projects screen.',
    });
  }

  const order = { high: 0, medium: 1, low: 2 } as const;
  return findings.sort((a, b) => order[a.severity] - order[b.severity]);
}

/** Per-business-unit rollup, weakest average progress first. */
export function businessUnitBreakdown(projects: ProjectRow[]) {
  const groups = new Map<string, ProjectRow[]>();
  for (const project of projects) {
    const list = groups.get(project.businessUnitName) ?? [];
    list.push(project);
    groups.set(project.businessUnitName, list);
  }

  return [...groups.entries()]
    .map(([name, rows]) => ({
      name,
      projects: rows.length,
      progress: Math.round(rows.reduce((sum, p) => sum + stageProgress(p.stage), 0) / rows.length),
      stalled: rows.filter((p) => daysSince(p.updatedAt) >= STALL_DAYS).length,
    }))
    .sort((a, b) => a.progress - b.progress);
}
