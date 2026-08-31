import { cn } from '../../lib/utils';

const TONES = {
  gold: 'border-gold-500/40 bg-gold-500/10 text-gold-200',
  neutral: 'border-white/12 bg-white/[0.04] text-white/60',
  ok: 'border-signal-ok/35 bg-signal-ok/10 text-signal-ok',
  warn: 'border-signal-warn/35 bg-signal-warn/10 text-signal-warn',
  risk: 'border-signal-risk/35 bg-signal-risk/10 text-signal-risk',
  info: 'border-signal-info/35 bg-signal-info/10 text-signal-info',
};

export default function Badge({ tone = 'neutral', icon: Icon, className = '', children, ...rest }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1',
        'font-mono text-[10px] uppercase tracking-[0.16em] leading-none whitespace-nowrap',
        TONES[tone] || TONES.neutral,
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={11} strokeWidth={2} aria-hidden />}
      {children}
    </span>
  );
}

/** A badge with a live pulse — reserved for genuinely current state. */
export function LiveBadge({ children = 'Live', tone = 'ok', className = '' }) {
  const dot = tone === 'ok' ? 'bg-signal-ok' : 'bg-gold-400';
  return (
    <Badge tone={tone} className={className}>
      <span className="relative flex h-1.5 w-1.5">
        <span className={cn('absolute inline-flex h-full w-full rounded-full opacity-70 animate-pulse-ring', dot)} />
        <span className={cn('relative inline-flex h-1.5 w-1.5 rounded-full', dot)} />
      </span>
      {children}
    </Badge>
  );
}
