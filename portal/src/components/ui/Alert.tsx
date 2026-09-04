import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

const TONES = {
  error: { cls: 'border-risk/35 bg-risk/[0.07] text-risk', Icon: AlertTriangle },
  success: { cls: 'border-ok/35 bg-ok/[0.07] text-ok', Icon: CheckCircle2 },
  info: { cls: 'border-info/35 bg-info/[0.07] text-info', Icon: Info },
} as const;

export function Alert({
  tone = 'info',
  children,
  className,
}: {
  tone?: keyof typeof TONES;
  children: ReactNode;
  className?: string;
}) {
  const { cls, Icon } = TONES[tone];
  return (
    <p
      role={tone === 'error' ? 'alert' : 'status'}
      className={cn('flex items-start gap-2.5 rounded-xl border p-3.5 text-[13px]', cls, className)}
    >
      <Icon size={15} strokeWidth={1.8} className="mt-px shrink-0" aria-hidden />
      <span>{children}</span>
    </p>
  );
}
