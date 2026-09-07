"use client";

import type { BusinessUnit, Project, ProjectStage, ProjectStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState } from "react";

import { StageBadge } from "@/components/ui/StageBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { STAGE_LABELS, STAGE_ORDER, STATUS_LABELS } from "@/lib/utils";

type ProjectRow = Project & {
  businessUnit: BusinessUnit;
  champion: { id: string; name: string; email: string } | null;
};

type Champion = { id: string; name: string; businessUnitId: string | null };

const STATUS_OPTIONS: ProjectStatus[] = ["ACTIVE", "ON_HOLD", "COMPLETED", "CANCELLED"];

export function MasterProjectTable({
  projects,
  businessUnits,
  champions,
}: {
  projects: ProjectRow[];
  businessUnits: BusinessUnit[];
  champions: Champion[];
}) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [filterBu, setFilterBu] = useState<string>("all");

  async function updateStage(projectId: string, toStage: string) {
    setBusyId(projectId);
    await fetch(`/api/projects/${projectId}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toStage, notes: "Updated from Executive Dashboard." }),
    });
    setBusyId(null);
    router.refresh();
  }

  async function updateProject(projectId: string, data: Record<string, unknown>) {
    setBusyId(projectId);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    setBusyId(null);
    router.refresh();
  }

  const filtered =
    filterBu === "all" ? projects : projects.filter((p) => p.businessUnitId === filterBu);

  return (
    <div className="card p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-neutral-100">Master Project Table</h2>
          <p className="text-xs text-neutral-500">{filtered.length} project(s)</p>
        </div>
        <select
          value={filterBu}
          onChange={(e) => setFilterBu(e.target.value)}
          className="input-field w-auto text-xs"
        >
          <option value="all">All Business Units</option>
          {businessUnits.map((bu) => (
            <option key={bu.id} value={bu.id}>
              {bu.name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs font-medium uppercase text-neutral-500">
              <th className="border-b border-surface-border px-2 py-2">Project</th>
              <th className="border-b border-surface-border px-2 py-2">Business Unit</th>
              <th className="border-b border-surface-border px-2 py-2">Champion</th>
              <th className="border-b border-surface-border px-2 py-2">Stage</th>
              <th className="border-b border-surface-border px-2 py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((project) => {
              const isBusy = busyId === project.id;
              const eligibleChampions = champions.filter(
                (c) => c.businessUnitId === project.businessUnitId
              );
              return (
                <tr key={project.id} className="border-b border-surface-border/60 align-middle">
                  <td className="px-2 py-2">
                    <Link
                      href={`/projects/${project.id}`}
                      className="font-medium text-neutral-100 hover:text-gold-400"
                    >
                      {project.name}
                    </Link>
                  </td>
                  <td className="px-2 py-2 text-neutral-400">{project.businessUnit.name}</td>
                  <td className="px-2 py-2">
                    <select
                      disabled={isBusy}
                      value={project.champion?.id ?? ""}
                      onChange={(e) =>
                        updateProject(project.id, { championId: e.target.value || null })
                      }
                      className="input-field w-auto text-xs"
                    >
                      <option value="">Unassigned</option>
                      {eligibleChampions.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <StageBadge stage={project.stage} />
                      <select
                        disabled={isBusy}
                        value={project.stage}
                        onChange={(e) => updateStage(project.id, e.target.value as ProjectStage)}
                        className="input-field w-auto text-xs"
                        aria-label="Change stage"
                      >
                        {STAGE_ORDER.map((stage) => (
                          <option key={stage} value={stage}>
                            {STAGE_LABELS[stage]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                  <td className="px-2 py-2">
                    <div className="flex items-center gap-2">
                      <StatusBadge status={project.status} />
                      <select
                        disabled={isBusy}
                        value={project.status}
                        onChange={(e) =>
                          updateProject(project.id, { status: e.target.value as ProjectStatus })
                        }
                        className="input-field w-auto text-xs"
                        aria-label="Change status"
                      >
                        {STATUS_OPTIONS.map((status) => (
                          <option key={status} value={status}>
                            {STATUS_LABELS[status]}
                          </option>
                        ))}
                      </select>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={5} className="px-2 py-8 text-center text-neutral-600">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
