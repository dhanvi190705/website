'use client';

import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-accent-gradient text-ground font-medium shadow-accent hover:brightness-110',
  outline: 'border border-accent/45 text-accent hover:border-accent hover:bg-accent/10',
  ghost: 'border border-line text-ink-muted hover:border-line hover:bg-white/[0.04] hover:text-ink',
  danger: 'border border-risk/40 text-risk hover:bg-risk/10',
};

const SIZES: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-[11px] tracking-[0.12em]',
  md: 'px-5 py-2.5 text-[11.5px] tracking-[0.16em]',
};

export function Button({
  variant = 'primary',
  size = 'md',
  icon: Icon,
  loading = false,
  className,
  children,
  disabled,
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  icon?: LucideIcon;
  loading?: boolean;
  children: ReactNode;
}) {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-xl font-mono uppercase',
        'transition-all duration-300 ease-smooth active:translate-y-px',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? (
        <Loader2 size={14} strokeWidth={2} className="animate-spin" aria-hidden />
      ) : (
        Icon && <Icon size={14} strokeWidth={1.9} aria-hidden />
      )}
      {children}
    </button>
  );
}
