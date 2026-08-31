import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowUpRight,
  Crown,
  FlaskConical,
  Gavel,
  GraduationCap,
  Presentation,
  Sparkles,
  Users,
} from 'lucide-react';
import { useState } from 'react';
import Badge, { LiveBadge } from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import GoldButton from '../components/ui/GoldButton';
import SectionHeading from '../components/ui/SectionHeading';
import StatTile from '../components/ui/StatTile';
import { pioneerPrivileges, timeline, visionStatement } from '../data/mockData';
import { cn } from '../lib/utils';

const ICONS = { Crown, FlaskConical, Gavel, Users, Presentation, GraduationCap };

const STATUS_TONE = { complete: 'ok', active: 'gold', upcoming: 'neutral' };
const STATUS_LABEL = { complete: 'Cleared', active: 'In flight', upcoming: 'Ahead' };

function Hero({ summary }) {
  return (
    <section className="relative pt-10">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="max-w-4xl"
      >
        <div className="mb-7 flex flex-wrap items-center gap-2.5">
          <LiveBadge tone="gold">Batch 01 · Live</LiveBadge>
          <Badge tone="neutral">Inaugural cohort</Badge>
          <Badge tone="neutral">19 departments</Badge>
        </div>

        <h1 className="text-[clamp(42px,8vw,104px)] leading-[0.92]">
          Pioneer
          <br />
          <span className="gold-text">Vision</span>
        </h1>

        <p className="mt-8 max-w-2xl text-balance text-[clamp(15px,1.7vw,19px)] leading-relaxed text-white/60">
          {visionStatement}
        </p>

        <div className="mt-9 flex flex-wrap items-center gap-3">
          <GoldButton size="lg" iconRight={ArrowUpRight} onClick={() => document.getElementById('milestone-path')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            Trace the path
          </GoldButton>
          <GoldButton size="lg" variant="outline" icon={Crown} onClick={() => document.getElementById('pioneer-privileges')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}>
            Pioneer privileges
          </GoldButton>
        </div>
      </motion.div>

      {/* Programme scoreboard */}
      <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.06] lg:grid-cols-4">
        {summary.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.18 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="bg-charcoal/80 p-6 backdrop-blur-xl md:p-7"
          >
            <StatTile {...stat} />
          </motion.div>
        ))}
      </div>
    </section>
  );
}

function MilestonePath() {
  // The active milestone opens by default — the programme's "you are here".
  const [openId, setOpenId] = useState(timeline.find((m) => m.status === 'active')?.id || timeline[0].id);
  const activeIndex = timeline.findIndex((m) => m.id === openId);
  const progress = ((timeline.filter((m) => m.status !== 'upcoming').length - 0.5) / timeline.length) * 100;

  return (
    <section id="milestone-path" className="scroll-mt-28 pt-28">
      <SectionHeading
        eyebrow="How AI NEXT started"
        title="The milestone path"
        highlight="milestone"
        lede="Seven moves from a training idea to champion-built tools in daily departmental use. Select any milestone to open it."
        aside={<Badge tone="gold" icon={Sparkles}>{timeline.filter((m) => m.status === 'complete').length} of {timeline.length} cleared</Badge>}
      />

      <div className="relative mt-14">
        {/* The rail everything hangs from. */}
        <div className="absolute left-0 right-0 top-[26px] hidden h-px bg-white/[0.08] lg:block">
          <motion.div
            className="h-full bg-gradient-to-r from-gold-700 via-gold-400 to-gold-500"
            initial={{ width: 0 }}
            whileInView={{ width: `${progress}%` }}
            viewport={{ once: true }}
            transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }}
          />
        </div>

        <ol className="grid grid-cols-2 gap-x-3 gap-y-8 sm:grid-cols-4 lg:grid-cols-7">
          {timeline.map((milestone, i) => {
            const open = milestone.id === openId;
            return (
              <li key={milestone.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenId(milestone.id)}
                  aria-expanded={open}
                  aria-controls="milestone-detail"
                  className="group w-full text-left"
                >
                  <span className="relative z-10 mb-4 flex h-[52px] items-center">
                    <span
                      className={cn(
                        'grid h-[26px] w-[26px] place-items-center rounded-full border transition-all duration-400 ease-premium',
                        milestone.status === 'upcoming'
                          ? 'border-white/15 bg-ink'
                          : 'border-gold-500/60 bg-charcoal',
                        open && 'scale-110 border-gold-400 shadow-gold',
                      )}
                    >
                      <span
                        className={cn(
                          'h-2 w-2 rounded-full transition-colors duration-300',
                          milestone.status === 'upcoming'
                            ? 'bg-white/20'
                            : milestone.status === 'active'
                              ? 'bg-gold-400'
                              : 'bg-gold-600',
                        )}
                      />
                      {milestone.status === 'active' && (
                        <span className="absolute inset-0 animate-pulse-ring rounded-full border border-gold-400/70" />
                      )}
                    </span>
                  </span>

                  <p
                    className={cn(
                      'font-mono text-[10px] uppercase tracking-[0.16em] transition-colors',
                      open ? 'text-gold-400' : 'text-white/35 group-hover:text-gold-500',
                    )}
                  >
                    {milestone.period}
                  </p>
                  <p
                    className={cn(
                      'mt-2 font-display text-[13px] uppercase leading-tight transition-colors',
                      open ? 'text-white' : 'text-white/55 group-hover:text-white/85',
                    )}
                    style={{ fontVariationSettings: "'wdth' 108" }}
                  >
                    {milestone.title}
                  </p>
                </button>
              </li>
            );
          })}
        </ol>

        <AnimatePresence mode="wait">
          <motion.div
            key={openId}
            id="milestone-detail"
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="mt-12"
          >
            <GlassCard className="p-7 md:p-9" glow>
              <div className="flex flex-col gap-8 md:flex-row md:items-start md:justify-between">
                <div className="max-w-2xl">
                  <div className="mb-4 flex flex-wrap items-center gap-2.5">
                    <Badge tone={STATUS_TONE[timeline[activeIndex].status]}>
                      {STATUS_LABEL[timeline[activeIndex].status]}
                    </Badge>
                    <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/35">
                      Milestone {String(activeIndex + 1).padStart(2, '0')} · {timeline[activeIndex].period}
                    </span>
                  </div>
                  <h3 className="text-2xl">{timeline[activeIndex].title}</h3>
                  <p className="mt-4 text-[15px] leading-relaxed text-white/60">
                    {timeline[activeIndex].body}
                  </p>
                </div>

                <div className="shrink-0 rounded-xl border border-gold-500/25 bg-gold-500/[0.06] px-7 py-6 text-center">
                  <p className="font-display text-4xl leading-none gold-text">
                    {timeline[activeIndex].stat.value}
                  </p>
                  <p className="mt-2.5 font-mono text-[10px] uppercase tracking-[0.16em] text-white/45">
                    {timeline[activeIndex].stat.label}
                  </p>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}

function PioneerPrivileges() {
  const [activeId, setActiveId] = useState(pioneerPrivileges[0].id);

  return (
    <section id="pioneer-privileges" className="scroll-mt-28 pt-28">
      <SectionHeading
        eyebrow="Batch 01 only"
        title="Pioneer privileges"
        highlight="privileges"
        lede="What being first actually buys you. These are attached to the inaugural cohort and do not transfer to later batches."
      />

      <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {pioneerPrivileges.map((privilege, i) => {
          const Icon = ICONS[privilege.icon] || Crown;
          const active = privilege.id === activeId;
          return (
            <GlassCard
              key={privilege.id}
              interactive
              sheen
              glow={active}
              onClick={() => setActiveId(privilege.id)}
              onMouseEnter={() => setActiveId(privilege.id)}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className="p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <span
                  className={cn(
                    'grid h-11 w-11 place-items-center rounded-xl border transition-all duration-400',
                    active
                      ? 'border-gold-500/50 bg-gold-500/12 text-gold-300'
                      : 'border-white/10 bg-white/[0.03] text-white/45',
                  )}
                >
                  <Icon size={18} strokeWidth={1.6} aria-hidden />
                </span>
                <span
                  className={cn(
                    'font-mono text-[10px] uppercase tracking-[0.16em] transition-colors',
                    active ? 'text-gold-500' : 'text-white/20',
                  )}
                >
                  {String(i + 1).padStart(2, '0')}
                </span>
              </div>

              <h3 className="mt-5 text-[15px] leading-snug">{privilege.title}</h3>
              <p className="mt-3 text-[13.5px] leading-relaxed text-white/50">{privilege.body}</p>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

export default function PioneerVision({ summary }) {
  return (
    <div className="pb-8">
      <Hero summary={summary} />
      <MilestonePath />
      <PioneerPrivileges />
    </div>
  );
}
