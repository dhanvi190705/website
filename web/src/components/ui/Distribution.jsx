import { motion } from 'framer-motion';
import { useId, useState } from 'react';
import { cn } from '../../lib/utils';

/**
 * Part-to-whole for a small, ordered set of segments (<= 6).
 *
 * Colour here is a sequential ramp over an ordered pipeline, so adjacent steps
 * are close by construction. Identity is therefore carried by three things
 * colour is not: a 2px surface gap between every arc, a direct label on every
 * legend row, and the hovered segment naming itself in the centre.
 */
export function DistributionRing({ segments, total, centerLabel = 'Projects', size = 216, className = '' }) {
  const [active, setActive] = useState(null);
  const titleId = useId();

  const stroke = 15;
  const radius = (size - stroke) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const sum = total || segments.reduce((a, s) => a + s.count, 0) || 1;
  const gap = 2; // px of surface between arcs

  let offset = 0;
  const arcs = segments.map((segment) => {
    const length = (segment.count / sum) * circumference;
    const arc = { ...segment, length: Math.max(0, length - gap), offset };
    offset += length;
    return arc;
  });

  const focused = active != null ? segments[active] : null;

  return (
    <div className={cn('flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:gap-8', className)}>
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <svg
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="img"
          aria-labelledby={titleId}
          className="-rotate-90"
        >
          <title id={titleId}>
            Project distribution across pipeline stages:{' '}
            {segments.map((s) => `${s.label} ${s.count}`).join(', ')}
          </title>

          {/* Recessive track so an empty stage still reads as part of the whole. */}
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth={stroke}
          />

          {arcs.map((arc, i) => (
            <motion.circle
              key={arc.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.accent}
              strokeWidth={active === i ? stroke + 5 : stroke}
              strokeLinecap="butt"
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={-arc.offset}
              initial={{ opacity: 0, strokeDasharray: `0 ${circumference}` }}
              whileInView={{ opacity: 1, strokeDasharray: `${arc.length} ${circumference - arc.length}` }}
              viewport={{ once: true }}
              transition={{ duration: 0.85, delay: i * 0.09, ease: [0.22, 1, 0.36, 1] }}
              style={{
                cursor: 'pointer',
                opacity: active == null || active === i ? 1 : 0.32,
                transition: 'stroke-width .25s cubic-bezier(.22,1,.36,1), opacity .25s',
              }}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
            />
          ))}
        </svg>

        {/* Centre reads the hovered segment, or the total at rest. */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <motion.span
            key={focused ? focused.id : 'total'}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="font-display text-4xl tabular-nums text-white"
          >
            {focused ? focused.count : sum}
          </motion.span>
          <span className="mt-1.5 max-w-[9rem] font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
            {focused ? focused.label : centerLabel}
          </span>
        </div>
      </div>

      {/* Legend doubles as the direct-label layer — always present, never optional. */}
      <ul className="w-full min-w-0 space-y-2.5">
        {segments.map((segment, i) => (
          <li
            key={segment.id}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-200',
              active === i ? 'bg-white/[0.05]' : 'bg-transparent',
            )}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ backgroundColor: segment.accent }}
            />
            <span className="flex-1 truncate text-[13px] text-white/75">{segment.label}</span>
            <span className="font-mono text-[12px] tabular-nums text-white">{segment.count}</span>
            <span className="w-10 text-right font-mono text-[11px] tabular-nums text-white/35">
              {segment.share}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The same distribution as a single stacked bar — useful directly beneath the
 * ring, where exact adjacency comparisons are easier to read than arcs.
 */
export function DistributionBar({ segments, className = '' }) {
  const [active, setActive] = useState(null);

  return (
    <div className={cn('w-full', className)}>
      <div className="flex h-3 w-full gap-[2px] overflow-hidden rounded-full">
        {segments.map((segment, i) => (
          <motion.div
            key={segment.id}
            className="relative h-full first:rounded-l-full last:rounded-r-full"
            style={{ backgroundColor: segment.accent }}
            initial={{ flexGrow: 0 }}
            whileInView={{ flexGrow: Math.max(segment.count, 0.35) }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: i * 0.07, ease: [0.22, 1, 0.36, 1] }}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            title={`${segment.label}: ${segment.count} (${segment.share}%)`}
          />
        ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2">
        {segments.map((segment, i) => (
          <span
            key={segment.id}
            className={cn(
              'flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.14em] transition-opacity',
              active == null || active === i ? 'opacity-100' : 'opacity-40',
            )}
          >
            <span
              aria-hidden
              className="h-1.5 w-1.5 rounded-full"
              style={{ backgroundColor: segment.accent }}
            />
            <span className="text-white/55">{segment.short || segment.label}</span>
            <span className="tabular-nums text-white/85">{segment.count}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
