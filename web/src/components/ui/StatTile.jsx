import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { cn } from '../../lib/utils';

/** Count a number up once, when the tile first scrolls into view. */
function useCountUp(target, active, duration = 1100) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return undefined;
    if (typeof target !== 'number') return undefined;
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) {
      setValue(target);
      return undefined;
    }

    let frame;
    const start = performance.now();
    const tick = (now) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(target * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, active, duration]);

  return value;
}

/**
 * The headline number. When one figure is the whole story, it is the chart —
 * no plot, no axis, no decoration competing with it.
 */
export default function StatTile({ value, label, hint, icon: Icon, tone = 'gold', className = '' }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const numeric = typeof value === 'number';
  const counted = useCountUp(numeric ? value : 0, inView);

  return (
    <div ref={ref} className={cn('relative', className)}>
      <div className="flex items-start justify-between gap-3">
        <p className="eyebrow">{label}</p>
        {Icon && (
          <Icon
            size={15}
            strokeWidth={1.5}
            aria-hidden
            className={tone === 'gold' ? 'text-gold-500/70' : 'text-white/30'}
          />
        )}
      </div>

      <motion.p
        className={cn(
          'mt-3 font-display text-[clamp(30px,4vw,46px)] leading-none tabular-nums',
          tone === 'gold' ? 'gold-text' : 'text-white',
        )}
        initial={{ opacity: 0, y: 8 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      >
        {numeric ? counted : value}
      </motion.p>

      {hint && <p className="mt-2 text-[12px] leading-relaxed text-white/40">{hint}</p>}
    </div>
  );
}
