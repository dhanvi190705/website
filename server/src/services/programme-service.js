import { getPrisma } from '../lib/prisma.js';
import { usePrisma } from '../lib/env.js';
import {
  champions as seedChampions,
  departments as seedDepartments,
  projects as seedProjects,
  reviewFlags,
} from '../data/seed-data.js';

/**
 * Reads for the roster and everything derived from it.
 *
 * Each function has two implementations behind one signature: a Prisma query,
 * and the seed dataset. The response shape is identical either way, which is
 * what lets the SPA point at mock data or the API without changing a line.
 */

const toProjectDto = (p) => ({
  id: p.id,
  name: p.name,
  owner: p.owner,
  deptCode: p.departmentCode,
  stage: p.stage,
  health: p.health,
  milestonesCleared: p.milestonesCleared,
  proofCount: p._count?.proofs ?? 0,
  pendingReview: p.pendingReview,
  updatedAt: (p.updatedAt instanceof Date ? p.updatedAt : new Date(p.updatedAt))
    .toISOString()
    .slice(0, 10),
});

const toChampionDto = (c) => ({
  id: c.id,
  name: c.name,
  deptCode: c.departmentCode,
  role: c.role,
});

export async function getProgramme() {
  if (!usePrisma) {
    return {
      departments: seedDepartments,
      champions: seedChampions,
      projects: seedProjects,
    };
  }

  const prisma = getPrisma();
  const [departments, champions, projects] = await Promise.all([
    prisma.department.findMany({ orderBy: { name: 'asc' } }),
    prisma.champion.findMany({ orderBy: { name: 'asc' } }),
    prisma.project.findMany({
      include: { _count: { select: { proofs: true } } },
      orderBy: { updatedAt: 'desc' },
    }),
  ]);

  return {
    departments: departments.map((d) => ({ code: d.code, name: d.name })),
    champions: champions.map(toChampionDto),
    projects: projects.map(toProjectDto),
  };
}

export async function getReviewQueue() {
  if (!usePrisma) {
    return reviewFlags
      .map((flag) => ({
        id: flag.id,
        projectId: seedProjects[flag.projectIndex]?.id,
        reason: flag.reason,
        age: flag.age,
        severity: flag.severity,
      }))
      .filter((flag) => flag.projectId);
  }

  const prisma = getPrisma();
  const flags = await prisma.reviewFlag.findMany({
    where: { resolved: false },
    orderBy: { createdAt: 'asc' },
    take: 20,
  });

  const dayMs = 86_400_000;
  return flags.map((flag) => ({
    id: flag.id,
    projectId: flag.projectId,
    reason: flag.reason,
    severity: flag.severity,
    age: Math.max(0, Math.round((Date.now() - flag.createdAt.getTime()) / dayMs)),
  }));
}

export { toProjectDto };
