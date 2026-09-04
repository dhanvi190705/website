import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

/**
 * The portal starts with no data at all, so empty states are a primary screen
 * rather than an edge case — each one says what is missing and who fixes it.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center px-6 py-14 text-center">
      <span className="grid h-12 w-12 place-items-center rounded-xl border border-line bg-white/[0.02] text-ink-faint">
        <Icon size={20} strokeWidth={1.5} aria-hidden />
      </span>
      <p className="mt-5 text-[15px] text-ink">{title}</p>
      <p className="mt-2 max-w-md text-[13px] leading-relaxed text-ink-muted">{description}</p>
      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
