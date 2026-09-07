import { STATUS_LABELS } from "@/lib/utils";

const STATUS_STYLES: Record<string, string> = {
  ACTIVE: "border-emerald-800 bg-emerald-950/60 text-emerald-300",
  ON_HOLD: "border-amber-800 bg-amber-950/60 text-amber-300",
  COMPLETED: "border-gold-700 bg-gold-950/40 text-gold-400",
  CANCELLED: "border-red-900 bg-red-950/60 text-red-300",
};

export function StatusBadge({ status }: { status: string }) {
  return (
    <span className={`badge ${STATUS_STYLES[status] ?? "border-surface-border bg-surface-100 text-neutral-300"}`}>
      {STATUS_LABELS[status] ?? status}
    </span>
  );
}
