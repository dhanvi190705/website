import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

type Tone = 'accent' | 'neutral' | 'ok' | 'warn' | 'risk' | 'info';

const TONES: Record<Tone, string> = {
  accent: 'border-accent/40 bg-accent/10 text-accent',
  neutral: 'border-line bg-white/[0.03] text-ink-muted',
  ok: 'border-ok/35 bg-ok/10 text-ok',
  warn: 'border-warn/35 bg-warn/10 text-warn',
  risk: 'border-risk/35 bg-risk/10 text-risk',
  info: 'border-info/35 bg-info/10 text-info',
};

export function Badge({
  tone = 'neutral',
  icon: Icon,
  className,
  children,
}: {
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-1',
        'font-mono text-[10px] uppercase leading-none tracking-[0.14em]',
        TONES[tone],
        className,
      )}
    >
      {Icon && <Icon size={11} strokeWidth={2} aria-hidden />}
      {children}
    </span>
  );
}
