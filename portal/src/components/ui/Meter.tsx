import { cn } from '@/lib/utils';

/** A single ratio against a limit. The number is always printed beside it. */
export function Meter({
  value,
  label,
  sublabel,
  color,
  className,
}: {
  value: number;
  label?: string;
  sublabel?: string;
  color?: string;
  className?: string;
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const fill = color ?? 'rgb(var(--c-accent))';

  return (
    <div className={cn('w-full', className)}>
      {(label || sublabel) && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {label && <span className="truncate text-[13px] text-ink">{label}</span>}
          {sublabel && (
            <span className="shrink-0 font-mono text-[10.5px] tabular-nums text-ink-faint">
              {sublabel}
            </span>
          )}
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]"
          role="meter"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label ?? 'Progress'}: ${pct} percent`}
        >
          <span
            className="block h-full rounded-full transition-[width] duration-700 ease-smooth"
            style={{ width: `${pct}%`, backgroundColor: fill }}
          />
        </div>
        <span className="w-10 shrink-0 text-right font-mono text-[12px] tabular-nums text-ink">
          {pct}%
        </span>
      </div>
    </div>
  );
}
