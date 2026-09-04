import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/** When one figure is the whole story, the number is the chart. */
export function StatTile({
  value,
  label,
  hint,
  icon: Icon,
  accent = true,
  className,
}: {
  value: string | number;
  label: string;
  hint?: string;
  icon?: LucideIcon;
  accent?: boolean;
  className?: string;
}) {
  return (
    <div className={cn('p-6', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {Icon && <Icon size={15} strokeWidth={1.5} aria-hidden className="text-ink-faint" />}
      </div>
      <p
        className={cn(
          'mt-3 text-[34px] font-medium leading-none tabular-nums',
          accent ? 'accent-text' : 'text-ink',
        )}
      >
        {value}
      </p>
      {hint && <p className="mt-2 text-[12px] leading-relaxed text-ink-faint">{hint}</p>}
    </div>
  );
}
