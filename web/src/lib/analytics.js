import { STAGES, stageIndex } from '../data/mockData';
import { daysBetween, healthBand } from './utils';

/** Count of projects per stage, in pipeline order, with share percentages. */
export function stageDistribution(projects) {
  const total = projects.length || 1;
  return STAGES.map((stage) => {
    const items = projects.filter((p) => p.stage === stage.id);
    return {
      ...stage,
      count: items.length,
      share: Math.round((items.length / total) * 100),
    };
  });
}

/** Roll-up numbers for the executive header strip. */
export function programmeSummary(projects, champions) {
  const total = projects.length || 1;
  const avgHealth = Math.round(projects.reduce((a, p) => a + p.health, 0) / total);
  const shipped = projects.filter((p) => stageIndex(p.stage) >= 3).length;

  return {
    totalProjects: projects.length,
    totalChampions: champions.filter((c) => c.role === 'champion').length,
    totalSpecialists: champions.filter((c) => c.role === 'specialist').length,
    departments: new Set(projects.map((p) => p.deptCode)).size,
    avgHealth,
    healthBand: healthBand(avgHealth),
    milestones: projects.reduce((a, p) => a + p.milestonesCleared, 0),
    shipped,
    shippedShare: Math.round((shipped / total) * 100),
    pendingReview: projects.filter((p) => p.pendingReview).length,
    stale: projects.filter((p) => daysBetween(p.updatedAt) > 14).length,
  };
}

/** Per-department health, ordered worst-first so problems surface at the top. */
export function departmentHealth(projects, departments, limit = 8) {
  return departments
    .map((dept) => {
      const items = projects.filter((p) => p.deptCode === dept.code);
      if (!items.length) return null;
      const score = Math.round(items.reduce((a, p) => a + p.health, 0) / items.length);
      return {
        ...dept,
        projects: items.length,
        score,
        band: healthBand(score),
        pending: items.filter((p) => p.pendingReview).length,
        milestones: items.reduce((a, p) => a + p.milestonesCleared, 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score)
    .slice(0, limit);
}

/** Projects that have not moved in a while — the executive's follow-up list. */
export function attentionList(projects, { days = 14, limit = 5 } = {}) {
  return projects
    .filter((p) => p.pendingReview || daysBetween(p.updatedAt) >= days)
    .sort((a, b) => daysBetween(b.updatedAt) - daysBetween(a.updatedAt))
    .slice(0, limit);
}
