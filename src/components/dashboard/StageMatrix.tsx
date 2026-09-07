import type { BusinessUnit } from "@prisma/client";

import { STAGE_LABELS, STAGE_ORDER } from "@/lib/utils";

export function StageMatrix({
  matrix,
}: {
  matrix: { businessUnit: BusinessUnit; counts: Record<string, number> }[];
}) {
  return (
    <div className="card h-full p-5">
      <h2 className="mb-1 text-sm font-semibold text-neutral-100">Stage Distribution Matrix</h2>
      <p className="mb-4 text-xs text-neutral-500">
        Active projects per business unit across the pipeline.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-surface-border px-2 py-2 text-left text-xs font-medium uppercase text-neutral-500">
                Business Unit
              </th>
              {STAGE_ORDER.map((stage) => (
                <th
                  key={stage}
                  className="border-b border-surface-border px-2 py-2 text-center text-xs font-medium text-neutral-500"
                  title={STAGE_LABELS[stage]}
                >
                  {STAGE_LABELS[stage]
                    .split(" ")
                    .map((w) => w[0])
                    .join("")}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {matrix.map(({ businessUnit, counts }) => (
              <tr key={businessUnit.id} className="border-b border-surface-border/60">
                <td className="px-2 py-2 text-neutral-200">{businessUnit.name}</td>
                {STAGE_ORDER.map((stage) => {
                  const count = counts[stage] ?? 0;
                  return (
                    <td key={stage} className="px-2 py-2 text-center">
                      <span
                        className={
                          count > 0
                            ? "inline-flex h-6 min-w-6 items-center justify-center rounded-full bg-gold-500/10 px-1.5 text-xs font-semibold text-gold-400"
                            : "text-xs text-neutral-700"
                        }
                      >
                        {count > 0 ? count : "–"}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
            {matrix.length === 0 && (
              <tr>
                <td colSpan={STAGE_ORDER.length + 1} className="px-2 py-6 text-center text-neutral-600">
                  No business units yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
