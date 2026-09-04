import { Role } from '@prisma/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { ProjectManager } from '@/components/admin/ProjectManager';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Projects · AI.Next Portal' };

export default async function AdminProjectsPage() {
  await requireRole(Role.TECH_TEAM);

  const [projects, units, champions] = await Promise.all([
    prisma.project.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        businessUnit: { select: { name: true } },
        champion: { select: { id: true, name: true } },
      },
    }),
    prisma.businessUnit.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
    prisma.user.findMany({
      where: { role: Role.CHAMPION, active: true },
      orderBy: { name: 'asc' },
      include: { businessUnit: { select: { name: true } } },
    }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Projects & assignment"
        description="Create initiatives and hand each one to the champion who will run it. Champions only ever see the projects assigned to them."
      />

      <ProjectManager
        units={units}
        champions={champions.map((champion) => ({
          id: champion.id,
          name: champion.name,
          businessUnitName: champion.businessUnit?.name ?? null,
        }))}
        initialProjects={projects.map((project) => ({
          id: project.id,
          name: project.name,
          summary: project.summary,
          stage: project.stage,
          businessUnitName: project.businessUnit.name,
          championId: project.champion?.id ?? null,
          championName: project.champion?.name ?? null,
          updatedAt: project.updatedAt.toISOString(),
        }))}
      />
    </>
  );
}
