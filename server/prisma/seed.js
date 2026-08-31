/**
 * Populate PostgreSQL with the Batch 01 roster.
 *
 * Idempotent: every write is an upsert keyed on a stable identifier, so running
 * `npm run seed` twice leaves the database in the same state rather than
 * duplicating the cohort.
 *
 *   npm run prisma:migrate   # create the schema
 *   npm run seed             # fill it
 */
import { PrismaClient } from '@prisma/client';
import {
  champions,
  departments,
  documents,
  projects,
  reviewFlags,
  seedProofs,
  seedReflections,
  currentUser,
} from '../src/data/seed-data.js';

const prisma = new PrismaClient();

const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);

async function main() {
  console.log('Seeding AI NEXT…');

  for (const dept of departments) {
    await prisma.department.upsert({
      where: { code: dept.code },
      update: { name: dept.name },
      create: { code: dept.code, name: dept.name },
    });
  }
  console.log(`  departments : ${departments.length}`);

  for (const champion of champions) {
    await prisma.champion.upsert({
      where: { id: champion.id },
      update: { name: champion.name, role: champion.role, departmentCode: champion.deptCode },
      create: {
        id: champion.id,
        name: champion.name,
        role: champion.role,
        departmentCode: champion.deptCode,
        badge: champion.role === 'champion' ? 'First Batch Champion' : 'AI Specialist',
      },
    });
  }
  console.log(`  champions   : ${champions.length}`);

  for (const project of projects) {
    // Lead the project with a champion from the same department where one exists.
    const lead = champions.find((c) => c.deptCode === project.deptCode && c.role === 'champion');

    await prisma.project.upsert({
      where: { id: project.id },
      update: {
        name: project.name,
        owner: project.owner,
        stage: project.stage,
        health: project.health,
        milestonesCleared: project.milestonesCleared,
        pendingReview: project.pendingReview,
      },
      create: {
        id: project.id,
        name: project.name,
        owner: project.owner,
        stage: project.stage,
        health: project.health,
        milestonesCleared: project.milestonesCleared,
        pendingReview: project.pendingReview,
        departmentCode: project.deptCode,
        leadId: lead?.id ?? null,
      },
    });
  }
  console.log(`  projects    : ${projects.length}`);

  // Give the demo champion's project a real proof and reflection trail.
  const demoProject = projects.find((p) => p.id === currentUser.projectId) || projects[0];
  if (demoProject) {
    await prisma.project.update({
      where: { id: demoProject.id },
      data: { leadId: currentUser.id },
    });

    for (const proof of seedProofs) {
      await prisma.proof.upsert({
        where: { id: proof.id },
        update: {},
        create: {
          id: proof.id,
          projectId: demoProject.id,
          addedById: currentUser.id,
          kind: proof.kind,
          name: proof.name,
          detail: proof.detail,
          sizeBytes: proof.size,
          createdAt: new Date(proof.addedAt),
        },
      });
    }

    for (const reflection of seedReflections) {
      await prisma.reflection.upsert({
        where: { id: reflection.id },
        update: {},
        create: {
          id: reflection.id,
          projectId: demoProject.id,
          authorId: currentUser.id,
          stage: reflection.stage,
          wins: reflection.wins,
          blockers: reflection.blockers,
          learnings: reflection.learnings,
          createdAt: new Date(reflection.createdAt),
        },
      });
    }
    console.log(`  workspace   : ${seedProofs.length} proofs, ${seedReflections.length} reflections`);
  }

  for (const flag of reviewFlags) {
    const project = projects[flag.projectIndex];
    if (!project) continue;
    await prisma.reviewFlag.upsert({
      where: { id: flag.id },
      update: { reason: flag.reason, severity: flag.severity },
      create: {
        id: flag.id,
        projectId: project.id,
        reason: flag.reason,
        severity: flag.severity,
        createdAt: daysAgo(flag.age),
      },
    });
  }
  console.log(`  review flags: ${reviewFlags.length}`);

  for (const doc of documents) {
    await prisma.resource.upsert({
      where: { slug: doc.slug },
      update: { title: doc.title, body: doc.body, meta: doc.meta, href: doc.href, order: doc.order },
      create: {
        slug: doc.slug,
        kicker: doc.kicker,
        title: doc.title,
        body: doc.body,
        meta: doc.meta,
        href: doc.href,
        category: doc.category,
        order: doc.order,
      },
    });
  }
  console.log(`  resources   : ${documents.length}`);

  console.log('Done.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
