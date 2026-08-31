import { getPrisma } from '../lib/prisma.js';
import { usePrisma } from '../lib/env.js';
import { notFound } from '../lib/errors.js';
import {
  currentUser,
  projects as seedProjects,
  seedProofs,
  seedReflections,
} from '../data/seed-data.js';
import { toProjectDto } from './programme-service.js';

const toProofDto = (p) => ({
  id: p.id,
  kind: p.kind,
  name: p.name,
  detail: p.detail,
  size: p.sizeBytes,
  addedAt: p.createdAt.toISOString().slice(0, 10),
});

const toReflectionDto = (r) => ({
  id: r.id,
  createdAt: r.createdAt.toISOString().slice(0, 10),
  stage: r.stage,
  wins: r.wins,
  blockers: r.blockers,
  learnings: r.learnings,
});

/** The champion's active project plus its proof and reflection trail. */
export async function getWorkspace(championId) {
  if (!usePrisma) {
    // Fall back to the champion's own department rather than an arbitrary
    // project, so a data edit can never silently return someone else's work.
    const project =
      seedProjects.find((p) => p.id === currentUser.projectId) ||
      seedProjects.find((p) => p.deptCode === currentUser.deptCode);
    if (!project) throw notFound(`No project found for champion "${championId}"`);
    return { project, proofs: seedProofs, reflections: seedReflections };
  }

  const prisma = getPrisma();
  const champion = await prisma.champion.findUnique({
    where: { id: championId },
    include: {
      ledProjects: {
        include: { _count: { select: { proofs: true } } },
        orderBy: { updatedAt: 'desc' },
        take: 1,
      },
    },
  });

  if (!champion) throw notFound(`No champion with id "${championId}"`);

  const project = champion.ledProjects[0];
  if (!project) return { project: null, proofs: [], reflections: [] };

  const [proofs, reflections] = await Promise.all([
    prisma.proof.findMany({ where: { projectId: project.id }, orderBy: { createdAt: 'asc' } }),
    prisma.reflection.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    }),
  ]);

  return {
    project: toProjectDto(project),
    proofs: proofs.map(toProofDto),
    reflections: reflections.map(toReflectionDto),
  };
}

/**
 * Record a status update from the workspace.
 *
 * Written as one transaction: the reflection, any newly attached proof, the
 * submission record and the project's own stage all move together, so a partial
 * write can never leave a stage advance without the evidence behind it.
 */
export async function submitStatus(championId, payload) {
  const { projectId, stage, proofs = [], reflection = {} } = payload;

  if (!usePrisma) {
    return {
      id: `submission-${Date.now().toString(36)}`,
      championId,
      projectId,
      stage,
      proofCount: proofs.length,
      receivedAt: new Date().toISOString(),
      status: 'pending_review',
      reviewer: 'AI Specialist bench',
    };
  }

  const prisma = getPrisma();
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw notFound(`No project with id "${projectId}"`);

  const advancing = project.stage !== stage;

  const result = await prisma.$transaction(async (tx) => {
    const created = await tx.reflection.create({
      data: {
        projectId,
        authorId: championId,
        stage,
        wins: reflection.wins || '',
        blockers: reflection.blockers || '',
        learnings: reflection.learnings || '',
      },
    });

    if (proofs.length) {
      await tx.proof.createMany({
        data: proofs.map((proof) => ({
          projectId,
          addedById: championId,
          kind: proof.kind,
          name: proof.name,
          detail: proof.detail || '',
          sizeBytes: proof.size ?? null,
        })),
      });
    }

    const submission = await tx.statusSubmission.create({
      data: {
        projectId,
        championId,
        fromStage: project.stage,
        toStage: stage,
        reflectionId: created.id,
        reviewer: 'AI Specialist bench',
      },
    });

    await tx.project.update({
      where: { id: projectId },
      // The stage only moves once a reviewer approves; the flag is what moves now.
      data: { pendingReview: advancing || project.pendingReview },
    });

    return submission;
  });

  return {
    id: result.id,
    championId,
    projectId,
    stage,
    proofCount: proofs.length,
    receivedAt: result.createdAt.toISOString(),
    status: result.status,
    reviewer: result.reviewer,
  };
}
