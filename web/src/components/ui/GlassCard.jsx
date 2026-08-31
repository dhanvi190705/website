import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

/**
 * The platform's one surface primitive.
 *
 * Everything sits on glass: a translucent charcoal panel, a hairline border that
 * warms to gold on hover, and an optional light sheen that sweeps across on
 * pointer-enter. Keeping it in one component is what makes forty panels across
 * five sections feel like a single material.
 */
export default function GlassCard({
  as: Tag = 'div',
  className = '',
  children,
  interactive = false,
  sheen = false,
  glow = false,
  ...rest
}) {
  const Comp = motion(Tag);

  return (
    <Comp
      className={cn(
        'glass group/card overflow-hidden',
        interactive && 'glass-hover cursor-pointer',
        glow && 'shadow-gold',
        className,
      )}
      {...(interactive
        ? { whileHover: { y: -4 }, transition: { type: 'spring', stiffness: 320, damping: 26 } }
        : {})}
      {...rest}
    >
      {/* Top-edge specular highlight — reads as polished glass, not a flat box. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-6 top-0 h-px bg-gradient-to-r from-transparent via-white/25 to-transparent"
      />
      {sheen && (
        <span
          aria-hidden
          className="pointer-events-none absolute inset-0 -translate-x-full bg-gold-sheen
            opacity-0 group-hover/card:animate-sheen group-hover/card:opacity-100"
        />
      )}
      <div className="relative">{children}</div>
    </Comp>
  );
}
