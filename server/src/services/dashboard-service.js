import { STAGE_ORDER } from '../data/seed-data.js';
import { getProgramme, getReviewQueue } from './programme-service.js';

const dayMs = 86_400_000;
const daysSince = (iso) => Math.round((Date.now() - new Date(iso).getTime()) / dayMs);

/**
 * The executive roll-up.
 *
 * Computed server-side as well as client-side on purpose: the SPA aggregates the
 * same numbers locally so it works offline on seed data, and this endpoint keeps
 * the figures authoritative once a database is behind it.
 */
export async function getDashboard() {
  const { projects, departments, champions } = await getProgramme();
  const reviewQueue = await getReviewQueue();

  const total = projects.length || 1;
  const shipped = projects.filter((p) => STAGE_ORDER.indexOf(p.stage) >= 3).length;

  const summary = {
    totalProjects: projects.length,
    totalChampions: champions.filter((c) => c.role === 'champion').length,
    totalSpecialists: champions.filter((c) => c.role === 'specialist').length,
    departments: new Set(projects.map((p) => p.deptCode)).size,
    avgHealth: Math.round(projects.reduce((a, p) => a + p.health, 0) / total),
    milestones: projects.reduce((a, p) => a + p.milestonesCleared, 0),
    shipped,
    shippedShare: Math.round((shipped / total) * 100),
    pendingReview: projects.filter((p) => p.pendingReview).length,
    stale: projects.filter((p) => daysSince(p.updatedAt) > 14).length,
  };

  const distribution = STAGE_ORDER.map((stage) => {
    const count = projects.filter((p) => p.stage === stage).length;
    return { stage, count, share: Math.round((count / total) * 100) };
  });

  const departmentHealth = departments
    .map((dept) => {
      const items = projects.filter((p) => p.deptCode === dept.code);
      if (!items.length) return null;
      return {
        code: dept.code,
        name: dept.name,
        projects: items.length,
        score: Math.round(items.reduce((a, p) => a + p.health, 0) / items.length),
        pending: items.filter((p) => p.pendingReview).length,
        milestones: items.reduce((a, p) => a + p.milestonesCleared, 0),
      };
    })
    .filter(Boolean)
    .sort((a, b) => a.score - b.score);

  return { projects, departments, champions, reviewQueue, summary, distribution, departmentHealth };
}
