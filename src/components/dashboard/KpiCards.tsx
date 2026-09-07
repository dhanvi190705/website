import { Building2, Rocket, Trophy } from "lucide-react";

function Kpi({
  icon: Icon,
  label,
  value,
  sublabel,
}: {
  icon: typeof Rocket;
  label: string;
  value: number;
  sublabel?: string;
}) {
  return (
    <div className="card flex items-center gap-4 p-5">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-semibold text-neutral-50">{value}</p>
        <p className="text-sm text-neutral-400">{label}</p>
        {sublabel && <p className="text-xs text-neutral-600">{sublabel}</p>}
      </div>
    </div>
  );
}

export function KpiCards({
  totalActive,
  fullAdoptionCount,
  activeBusinessUnits,
  totalProjects,
}: {
  totalActive: number;
  fullAdoptionCount: number;
  activeBusinessUnits: number;
  totalProjects: number;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <Kpi
        icon={Rocket}
        label="Total Active AI Projects"
        value={totalActive}
        sublabel={`${totalProjects} total across all statuses`}
      />
      <Kpi
        icon={Trophy}
        label="Full Adoption Count"
        value={fullAdoptionCount}
        sublabel="Value realization achieved"
      />
      <Kpi
        icon={Building2}
        label="Active Business Units"
        value={activeBusinessUnits}
        sublabel="Onboarded to AI NEXT"
      />
    </div>
  );
}
