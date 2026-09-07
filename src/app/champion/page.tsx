import { AnnouncementsFeed } from "@/components/champion/AnnouncementsFeed";
import { ProjectCard } from "@/components/champion/ProjectCard";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ChampionDashboardPage() {
  const session = await requireSession();

  const [projects, announcements] = await Promise.all([
    prisma.project.findMany({
      where: { championId: session.user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        businessUnit: true,
        evidence: { orderBy: { createdAt: "desc" }, take: 5 },
      },
    }),
    prisma.announcement.findMany({
      where: { isPublished: true },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: { author: { select: { name: true } } },
    }),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">
          Welcome back, {(session.user.name ?? "").split(" ")[0] || "there"}
        </h1>
        <p className="mt-1 text-sm text-neutral-500">
          {session.user.businessUnitName
            ? `Your assigned AI projects in ${session.user.businessUnitName}.`
            : "Your assigned AI projects."}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {projects.length === 0 && (
            <div className="card p-8 text-center text-sm text-neutral-500">
              No projects have been assigned to you yet. Reach out to your AI Tech Team
              admin to get your first initiative allocated.
            </div>
          )}
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        <div className="lg:col-span-1">
          <AnnouncementsFeed announcements={announcements} />
        </div>
      </div>
    </div>
  );
}
