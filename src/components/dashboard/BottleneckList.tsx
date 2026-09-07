import type { BusinessUnit, Project } from "@prisma/client";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";

import { StageBadge } from "@/components/ui/StageBadge";

type BottleneckProject = Project & { businessUnit: BusinessUnit };

export function BottleneckList({
  bottlenecks,
}: {
  bottlenecks: { project: BottleneckProject; daysInStage: number }[];
}) {
  return (
    <div className="card h-full p-5">
      <div className="mb-1 flex items-center gap-2">
        <AlertTriangle className="h-4 w-4 text-amber-400" />
        <h2 className="text-sm font-semibold text-neutral-100">Bottleneck Indicators</h2>
      </div>
      <p className="mb-4 text-xs text-neutral-500">
        Projects stalled 14+ days in Feasibility or Testing.
      </p>

      <div className="space-y-2">
        {bottlenecks.length === 0 && (
          <p className="py-6 text-center text-sm text-neutral-600">
            No stalled projects right now. 🎉
          </p>
        )}
        {bottlenecks.map(({ project, daysInStage }) => (
          <Link
            key={project.id}
            href={`/projects/${project.id}`}
            className="flex items-center justify-between gap-3 rounded-lg border border-amber-900/40 bg-amber-950/20 px-3 py-2.5 transition hover:border-amber-700/60"
          >
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-neutral-100">{project.name}</p>
              <p className="text-xs text-neutral-500">{project.businessUnit.name}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-1">
              <StageBadge stage={project.stage} />
              <span className="text-xs font-medium text-amber-400">{daysInStage}d stalled</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
