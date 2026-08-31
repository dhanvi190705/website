import { motion } from 'framer-motion';
import { cn, healthBand } from '../../lib/utils';

/**
 * A single ratio against a limit — the correct form for one health score.
 *
 * The value is always printed next to the track and the band is always named,
 * so the reading never depends on colour alone.
 */
export default function Meter({
  value,
  label,
  sublabel,
  showBand = true,
  color,
  className = '',
  trackClassName = '',
}) {
  const pct = Math.max(0, Math.min(100, Math.round(value)));
  const band = healthBand(pct);
  const fill = color || band.color;

  return (
    <div className={cn('w-full', className)}>
      {(label || sublabel) && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          <span className="truncate text-[13px] text-white/80">{label}</span>
          <span className="shrink-0 font-mono text-[11px] tabular-nums text-white/45">
            {sublabel}
          </span>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn('h-1.5 flex-1 overflow-hidden rounded-full bg-white/[0.07]', trackClassName)}
          role="meter"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`${label || 'Health'}: ${pct} out of 100, ${band.label}`}
        >
          <motion.span
            className="block h-full rounded-full"
            style={{ backgroundColor: fill, boxShadow: `0 0 12px -2px ${fill}` }}
            initial={{ width: 0 }}
            whileInView={{ width: `${pct}%` }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <span className="w-9 shrink-0 text-right font-mono text-[12px] tabular-nums text-white">
          {pct}
        </span>
        {showBand && (
          <span
            className="w-16 shrink-0 font-mono text-[10px] uppercase tracking-[0.12em]"
            style={{ color: fill }}
          >
            {band.label}
          </span>
        )}
      </div>
    </div>
  );
}
