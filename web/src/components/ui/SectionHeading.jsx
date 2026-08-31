import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

export default function SectionHeading({ eyebrow, title, highlight, lede, aside, className = '' }) {
  // Split the title so one word can carry the gold without a second element.
  const parts = highlight && title.includes(highlight) ? title.split(highlight) : null;

  return (
    <div className={cn('flex flex-col gap-6 md:flex-row md:items-end md:justify-between', className)}>
      <motion.div
        initial={{ opacity: 0, y: 18 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-2xl"
      >
        {eyebrow && <p className="eyebrow mb-4">{eyebrow}</p>}
        <h2 className="text-[clamp(30px,4.4vw,54px)]">
          {parts ? (
            <>
              {parts[0]}
              <span className="gold-text">{highlight}</span>
              {parts[1]}
            </>
          ) : (
            title
          )}
        </h2>
        {lede && <p className="mt-5 text-balance text-[15px] leading-relaxed text-white/55">{lede}</p>}
      </motion.div>

      {aside && <div className="shrink-0">{aside}</div>}
    </div>
  );
}
