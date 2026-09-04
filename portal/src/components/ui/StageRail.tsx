import { Stage } from '@prisma/client';
import { STAGES, stageIndex, stageMeta } from '@/lib/stages';
import { cn } from '@/lib/utils';

/**
 * Where a project sits in the 5-stage pipeline.
 *
 * The stage is always named in text next to the rail — the colour ramp encodes
 * how far along, but it is never the only carrier of the reading.
 */
export function StageRail({
  stage,
  showLabel = true,
  className,
}: {
  stage: Stage;
  showLabel?: boolean;
  className?: string;
}) {
  const current = stageIndex(stage);
  const meta = stageMeta(stage);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex items-center gap-1.5" role="img" aria-label={`Stage ${current + 1} of ${STAGES.length}: ${meta.label}`}>
        {STAGES.map((s, i) => (
          <span
            key={s.id}
            className="h-1.5 flex-1 rounded-full transition-colors duration-500"
            style={{ backgroundColor: i <= current ? s.accent : 'rgb(255 255 255 / 0.08)' }}
          />
        ))}
      </div>

      {showLabel && (
        <p className="mt-2.5 flex items-center justify-between gap-3">
          <span className="truncate text-[12.5px] text-ink-muted">{meta.label}</span>
          <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
            {current + 1}/{STAGES.length}
          </span>
        </p>
      )}
    </div>
  );
}

export function StageChip({ stage }: { stage: Stage }) {
  const meta = stageMeta(stage);
  return (
    <span className="inline-flex items-center gap-2 whitespace-nowrap font-mono text-[10.5px] uppercase tracking-[0.12em] text-ink-muted">
      <span
        aria-hidden
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ backgroundColor: meta.accent }}
      />
      {meta.short}
    </span>
  );
}
