import { STAGE_LABELS } from "@/lib/utils";

const STAGE_STYLES: Record<string, string> = {
  IDEATION_AND_SOLUTION_DEFINITION: "border-sky-800 bg-sky-950/60 text-sky-300",
  FEASIBILITY_AND_SCOPING: "border-amber-800 bg-amber-950/60 text-amber-300",
  DEVELOPMENT_AND_INTEGRATION: "border-violet-800 bg-violet-950/60 text-violet-300",
  TESTING_AND_PILOT_DEPLOYMENT: "border-orange-800 bg-orange-950/60 text-orange-300",
  FULL_ADOPTION_AND_VALUE_REALIZATION: "border-emerald-800 bg-emerald-950/60 text-emerald-300",
};

export function StageBadge({ stage }: { stage: string }) {
  return (
    <span className={`badge ${STAGE_STYLES[stage] ?? "border-surface-border bg-surface-100 text-neutral-300"}`}>
      {STAGE_LABELS[stage] ?? stage}
    </span>
  );
}
