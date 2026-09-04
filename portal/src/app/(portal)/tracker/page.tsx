import { SquareKanban } from 'lucide-react';
import { Role } from '@prisma/client';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectTracker } from '@/components/tracker/ProjectTracker';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Project Tracker · AI.Next Portal' };

/**
 * The champion's workspace: pick an assigned project, move it through the
 * pipeline, and attach the evidence that backs the claim.
 */
export default async function TrackerPage() {
  const user = await requireUser();

  // The AI/Tech Team can see the tracker too — for them it spans every project
  // so they can correct a record without impersonating a champion.
  const projects = await prisma.project.findMany({
    where: user.role === Role.TECH_TEAM ? {} : { championId: user.id },
    orderBy: { updatedAt: 'desc' },
    include: {
      businessUnit: { select: { name: true } },
      champion: { select: { name: true } },
      updates: {
        orderBy: { createdAt: 'desc' },
        take: 20,
        include: { author: { select: { name: true } } },
      },
      evidence: {
        orderBy: { createdAt: 'desc' },
        take: 40,
        include: { uploadedBy: { select: { name: true } } },
      },
    },
  });

  const payload = projects.map((project) => ({
    id: project.id,
    name: project.name,
    summary: project.summary,
    stage: project.stage,
    businessUnitName: project.businessUnit.name,
    championName: project.champion?.name ?? null,
    updatedAt: project.updatedAt.toISOString(),
    updates: project.updates.map((update) => ({
      id: update.id,
      fromStage: update.fromStage,
      toStage: update.toStage,
      note: update.note,
      createdAt: update.createdAt.toISOString(),
      authorName: update.author.name,
    })),
    evidence: project.evidence.map((item) => ({
      id: item.id,
      kind: item.kind,
      label: item.label,
      note: item.note,
      stage: item.stage,
      url: item.url,
      originalName: item.originalName,
      mimeType: item.mimeType,
      sizeBytes: item.sizeBytes,
      createdAt: item.createdAt.toISOString(),
      uploadedByName: item.uploadedBy.name,
    })),
  }));

  return (
    <>
      <PageHeader
        eyebrow={`Project Tracker · ${user.businessUnitName ?? 'AI / Tech Team'}`}
        title="Where your initiative actually stands"
        description="Select a project, move it through the five stages as reality changes, and attach the evidence a reviewer can open."
      />

      {payload.length === 0 ? (
        <Card>
          <EmptyState
            icon={SquareKanban}
            title="No projects assigned to you yet"
            description={
              user.role === Role.TECH_TEAM
                ? 'No projects exist yet. Create one from the Projects screen and assign it to a champion.'
                : 'The AI / Tech Team assigns initiatives to champions. Once one is assigned to you it will appear here.'
            }
          />
        </Card>
      ) : (
        <ProjectTracker projects={payload} />
      )}
    </>
  );
}
