import { motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';

/**
 * The room the product sits in.
 *
 * Three slow-drifting gold auras over a faint engineering grid, with a vignette
 * pulling focus to the centre. No 3D primitives — the depth comes from light,
 * blur and parallax, which is what makes it read as premium rather than as a
 * demo of a graphics library.
 */
export default function AmbientBackground() {
  const reduced = useReducedMotion();
  const { scrollYProgress } = useScroll();
  const driftY = useTransform(scrollYProgress, [0, 1], ['0%', '-14%']);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-0 overflow-hidden bg-ink">
      {/* Structure grid — barely there, but it stops the black reading as empty. */}
      <div className="absolute inset-0 bg-grid bg-grid opacity-[0.55] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_35%,#000_20%,transparent_78%)]" />

      <motion.div style={reduced ? undefined : { y: driftY }} className="absolute inset-0">
        <div
          className="absolute -top-[18%] left-[8%] h-[46vw] w-[46vw] rounded-full opacity-[0.55] blur-[120px] animate-drift"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.30), transparent 66%)' }}
        />
        <div
          className="absolute top-[26%] right-[-8%] h-[38vw] w-[38vw] rounded-full opacity-40 blur-[130px] animate-drift"
          style={{
            background: 'radial-gradient(circle, rgba(255,215,0,0.22), transparent 68%)',
            animationDelay: '-9s',
          }}
        />
        <div
          className="absolute bottom-[-14%] left-[26%] h-[42vw] w-[42vw] rounded-full opacity-30 blur-[150px] animate-drift"
          style={{
            background: 'radial-gradient(circle, rgba(125,167,219,0.18), transparent 70%)',
            animationDelay: '-17s',
          }}
        />
      </motion.div>

      {/* Vignette + film grain keep the large black areas from banding. */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_0%,transparent_10%,rgba(11,11,11,0.55)_60%,#0B0B0B_100%)]" />
      <div
        className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3'/%3E%3C/filter%3E%3Crect width='140' height='140' filter='url(%23n)'/%3E%3C/svg%3E\")",
        }}
      />
    </div>
  );
}
