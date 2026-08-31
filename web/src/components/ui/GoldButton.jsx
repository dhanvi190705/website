import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

const VARIANTS = {
  // Solid metallic — the single primary action on a screen.
  solid:
    'bg-gold-gradient text-ink font-medium shadow-gold hover:shadow-gold-lg disabled:shadow-none',
  // Gold hairline — secondary actions that still belong to the brand.
  outline:
    'border border-gold-500/45 text-gold-300 hover:border-gold-400 hover:text-gold-100 hover:bg-gold-500/10',
  // Neutral glass — tertiary and destructive-adjacent actions.
  ghost: 'border border-white/10 text-white/70 hover:border-white/25 hover:text-white hover:bg-white/5',
};

const SIZES = {
  sm: 'px-3.5 py-2 text-[11px] tracking-[0.16em]',
  md: 'px-5 py-2.5 text-[12px] tracking-[0.18em]',
  lg: 'px-7 py-3.5 text-[13px] tracking-[0.2em]',
};

export default function GoldButton({
  as: Tag = 'button',
  variant = 'solid',
  size = 'md',
  className = '',
  icon: Icon,
  iconRight: IconRight,
  children,
  disabled,
  ...rest
}) {
  const Comp = motion(Tag);

  return (
    <Comp
      className={cn(
        'relative inline-flex items-center justify-center gap-2 rounded-xl font-mono uppercase',
        'transition-all duration-300 ease-premium',
        'disabled:cursor-not-allowed disabled:opacity-40',
        VARIANTS[variant],
        SIZES[size],
        className,
      )}
      whileHover={disabled ? undefined : { y: -2 }}
      whileTap={disabled ? undefined : { y: 0, scale: 0.985 }}
      transition={{ type: 'spring', stiffness: 400, damping: 28 }}
      disabled={Tag === 'button' ? disabled : undefined}
      aria-disabled={disabled || undefined}
      {...rest}
    >
      {Icon && <Icon size={15} strokeWidth={1.75} aria-hidden />}
      {children}
      {IconRight && <IconRight size={15} strokeWidth={1.75} aria-hidden />}
    </Comp>
  );
}
