'use client';

import { useId, useState } from 'react';
import type { StageSlice } from '@/lib/analytics';
import { cn } from '@/lib/utils';

/**
 * Part-to-whole across the five ordered stages.
 *
 * The ramp encodes how far along a stage is, so adjacent steps are close by
 * design. Identity is therefore carried by three things colour is not: a gap
 * between arcs, a direct label on every legend row, and the hovered segment
 * naming itself in the centre.
 */
export function StageDistribution({
  slices,
  total,
  size = 208,
}: {
  slices: StageSlice[];
  total: number;
  size?: number;
}) {
  const [active, setActive] = useState<number | null>(null);
  const titleId = useId();

  const stroke = 14;
  const radius = (size - stroke) / 2 - 2;
  const circumference = 2 * Math.PI * radius;
  const sum = total || 1;
  const gap = 2;

  let cursor = 0;
  const arcs = slices.map((slice) => {
    const length = (slice.count / sum) * circumference;
    const arc = { ...slice, length: Math.max(0, length - gap), offset: cursor };
    cursor += length;
    return arc;
  });

  const focused = active !== null ? slices[active] : null;

  return (
    <div className="flex flex-col items-center gap-7 sm:flex-row sm:gap-8">
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
            Projects by stage: {slices.map((s) => `${s.label} ${s.count}`).join(', ')}
          </title>

          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            fill="none"
            stroke="rgb(255 255 255 / 0.05)"
            strokeWidth={stroke}
          />

          {arcs.map((arc, i) => (
            <circle
              key={arc.id}
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="none"
              stroke={arc.accent}
              strokeWidth={active === i ? stroke + 5 : stroke}
              strokeDasharray={`${arc.length} ${circumference - arc.length}`}
              strokeDashoffset={-arc.offset}
              onMouseEnter={() => setActive(i)}
              onMouseLeave={() => setActive(null)}
              style={{
                cursor: 'pointer',
                opacity: active === null || active === i ? 1 : 0.3,
                transition: 'stroke-width .25s cubic-bezier(.22,1,.36,1), opacity .25s',
              }}
            />
          ))}
        </svg>

        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[32px] font-medium leading-none tabular-nums text-ink">
            {focused ? focused.count : total}
          </span>
          <span className="mt-1.5 max-w-[8.5rem] font-mono text-[9.5px] uppercase leading-tight tracking-[0.14em] text-ink-faint">
            {focused ? focused.short : 'Projects'}
          </span>
        </div>
      </div>

      <ul className="w-full min-w-0 space-y-2">
        {slices.map((slice, i) => (
          <li
            key={slice.id}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive(null)}
            className={cn(
              'flex items-center gap-3 rounded-lg px-2 py-1.5 transition-colors duration-200',
              active === i ? 'bg-white/[0.05]' : '',
            )}
          >
            <span
              aria-hidden
              className="h-2.5 w-2.5 shrink-0 rounded-[3px]"
              style={{ backgroundColor: slice.accent }}
            />
            <span className="flex-1 truncate text-[12.5px] text-ink-muted">{slice.label}</span>
            <span className="font-mono text-[12px] tabular-nums text-ink">{slice.count}</span>
            <span className="w-9 text-right font-mono text-[11px] tabular-nums text-ink-faint">
              {slice.share}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
