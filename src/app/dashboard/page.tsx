import { ProjectStage, ProjectStatus } from "@prisma/client";

import { BottleneckList } from "@/components/dashboard/BottleneckList";
import { KpiCards } from "@/components/dashboard/KpiCards";
import { MasterProjectTable } from "@/components/dashboard/MasterProjectTable";
import { StageMatrix } from "@/components/dashboard/StageMatrix";
import { prisma } from "@/lib/prisma";
import { STAGE_ORDER } from "@/lib/utils";

export const dynamic = "force-dynamic";

const BOTTLENECK_STAGES: ProjectStage[] = [
  ProjectStage.FEASIBILITY_AND_SCOPING,
  ProjectStage.TESTING_AND_PILOT_DEPLOYMENT,
];
const BOTTLENECK_THRESHOLD_DAYS = 14;

async function getDashboardData() {
  const [totalActive, fullAdoptionCount, activeBusinessUnits, businessUnits, projects, champions] =
    await Promise.all([
      prisma.project.count({ where: { status: ProjectStatus.ACTIVE } }),
      prisma.project.count({
        where: { stage: ProjectStage.FULL_ADOPTION_AND_VALUE_REALIZATION },
      }),
      prisma.businessUnit.count({ where: { isActive: true } }),
      prisma.businessUnit.findMany({ orderBy: { name: "asc" } }),
      prisma.project.findMany({
        orderBy: { updatedAt: "desc" },
        include: {
          businessUnit: true,
          champion: { select: { id: true, name: true, email: true } },
        },
      }),
      prisma.user.findMany({
        where: { role: "AI_CHAMPION", isActive: true },
        select: { id: true, name: true, businessUnitId: true },
        orderBy: { name: "asc" },
      }),
    ]);

  // Stage distribution matrix: BusinessUnit x Stage -> active project count
  const matrix = businessUnits.map((bu) => {
    const row: Record<string, number> = {};
    for (const stage of STAGE_ORDER) {
      row[stage] = projects.filter(
        (p) => p.businessUnitId === bu.id && p.stage === stage && p.status === ProjectStatus.ACTIVE
      ).length;
    }
    return { businessUnit: bu, counts: row };
  });

  // Bottleneck indicators: active projects sitting in a bottleneck-prone stage
  // for longer than the threshold, based on the most recent stage transition.
  const bottleneckCandidates = projects.filter(
    (p) => p.status === ProjectStatus.ACTIVE && BOTTLENECK_STAGES.includes(p.stage)
  );

  const latestStageChanges = await prisma.projectStageHistory.findMany({
    where: { projectId: { in: bottleneckCandidates.map((p) => p.id) } },
    orderBy: { createdAt: "desc" },
    distinct: ["projectId"],
  });
  const lastChangeByProject = new Map(latestStageChanges.map((h) => [h.projectId, h.createdAt]));

  const now = Date.now();
  const bottlenecks = bottleneckCandidates
    .map((p) => {
      const since = lastChangeByProject.get(p.id) ?? p.createdAt;
      const daysInStage = Math.floor((now - since.getTime()) / (1000 * 60 * 60 * 24));
      return { project: p, daysInStage };
    })
    .filter((b) => b.daysInStage >= BOTTLENECK_THRESHOLD_DAYS)
    .sort((a, b) => b.daysInStage - a.daysInStage);

  return {
    kpis: {
      totalActive,
      fullAdoptionCount,
      activeBusinessUnits,
    },
    matrix,
    bottlenecks,
    projects,
    businessUnits,
    champions,
  };
}

export default async function ExecutiveDashboardPage() {
  const { kpis, matrix, bottlenecks, projects, businessUnits, champions } = await getDashboardData();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">Executive Dashboard</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Portfolio-wide view of every AI initiative across Rustomjee business units.
        </p>
      </div>

      <KpiCards {...kpis} totalProjects={projects.length} />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <StageMatrix matrix={matrix} />
        </div>
        <div className="lg:col-span-2">
          <BottleneckList bottlenecks={bottlenecks} />
        </div>
      </div>

      <MasterProjectTable
        projects={projects}
        businessUnits={businessUnits}
        champions={champions}
      />
    </div>
  );
}
