import { Role } from "@prisma/client";
import { FileText, History } from "lucide-react";
import { notFound, redirect } from "next/navigation";

import { ProjectActions } from "@/components/projects/ProjectActions";
import { StageBadge } from "@/components/ui/StageBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { prisma } from "@/lib/prisma";
import { requireSession } from "@/lib/session";
import { formatBytes, STAGE_LABELS } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({ params }: { params: { id: string } }) {
  const session = await requireSession();

  const project = await prisma.project.findUnique({
    where: { id: params.id },
    include: {
      businessUnit: true,
      champion: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      stageHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { id: true, name: true } } },
      },
      evidence: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { id: true, name: true } } },
      },
    },
  });

  if (!project) notFound();

  const isAdmin = session.user.role === Role.AI_TECH_TEAM;
  const isOwningChampion = project.championId === session.user.id;

  if (!isAdmin && !isOwningChampion) {
    redirect("/champion");
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div className="card p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-xl font-semibold text-neutral-50">{project.name}</h1>
            <p className="text-sm text-neutral-500">
              {project.businessUnit.name} · Champion: {project.champion?.name ?? "Unassigned"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <StageBadge stage={project.stage} />
            <StatusBadge status={project.status} />
          </div>
        </div>
        <p className="mt-4 text-sm text-neutral-400">{project.description}</p>
        <p className="mt-4 text-xs text-neutral-600">
          Created by {project.createdBy.name} on {new Date(project.createdAt).toLocaleDateString()}
        </p>
      </div>

      {(isAdmin || isOwningChampion) && <ProjectActions project={project} />}

      <div className="grid gap-6 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <History className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-neutral-100">Stage History (Audit Log)</h2>
          </div>
          <ol className="space-y-3 border-l border-surface-border pl-4">
            {project.stageHistory.map((h) => (
              <li key={h.id} className="relative">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full bg-gold-500" />
                <p className="text-sm text-neutral-200">
                  {h.fromStage ? STAGE_LABELS[h.fromStage] : "Created"} →{" "}
                  <span className="font-medium">{STAGE_LABELS[h.toStage]}</span>
                </p>
                <p className="text-xs text-neutral-600">
                  {h.changedBy.name} · {new Date(h.createdAt).toLocaleString()}
                </p>
                {h.notes && <p className="mt-1 text-xs text-neutral-500">{h.notes}</p>}
              </li>
            ))}
            {project.stageHistory.length === 0 && (
              <p className="text-sm text-neutral-600">No stage changes recorded yet.</p>
            )}
          </ol>
        </div>

        <div className="card p-5">
          <div className="mb-4 flex items-center gap-2">
            <FileText className="h-4 w-4 text-gold-500" />
            <h2 className="text-sm font-semibold text-neutral-100">Evidence</h2>
          </div>
          <div className="space-y-2">
            {project.evidence.map((ev) => (
              <a
                key={ev.id}
                href={ev.fileUrl}
                target="_blank"
                rel="noreferrer"
                className="block rounded-lg border border-surface-border px-3 py-2 transition hover:border-gold-600"
              >
                <p className="truncate text-sm text-neutral-200">{ev.fileName}</p>
                <p className="text-xs text-neutral-600">
                  {formatBytes(ev.fileSize)} · {ev.uploadedBy.name} ·{" "}
                  {new Date(ev.createdAt).toLocaleDateString()}
                </p>
                {ev.description && <p className="mt-1 text-xs text-neutral-500">{ev.description}</p>}
              </a>
            ))}
            {project.evidence.length === 0 && (
              <p className="text-sm text-neutral-600">No evidence uploaded yet.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
