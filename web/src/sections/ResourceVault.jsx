import { motion } from 'framer-motion';
import {
  ArrowUpRight,
  BookOpen,
  CalendarClock,
  Download,
  ExternalLink,
  Landmark,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge, { LiveBadge } from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import GoldButton from '../components/ui/GoldButton';
import SectionHeading from '../components/ui/SectionHeading';
import { policyFrameworks, vaultDocuments } from '../data/mockData';
import { buildNewsletterIssues, nextIssueCountdown } from '../lib/newsletters';
import { cn } from '../lib/utils';

const DOC_ICON = { BookOpen, ShieldCheck };

function NewsletterHub() {
  // Recomputed per mount: the run is derived from the calendar, not hard-coded.
  const issues = useMemo(() => buildNewsletterIssues(), []);
  const countdown = useMemo(() => nextIssueCountdown(issues), [issues]);
  const [openId, setOpenId] = useState(issues.find((i) => i.status === 'live')?.id || issues[0]?.id);

  return (
    <section>
      <SectionHeading
        eyebrow="Every 15 days"
        title="Newsletter hub"
        highlight="Newsletter"
        lede="A fortnightly round-up of what every department is building — champion progress, milestones cleared, and what is coming next. Issues generate themselves on the cadence."
        aside={
          countdown && (
            <GlassCard className="px-6 py-5">
              <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                Next issue
              </p>
              <p className="mt-2.5 font-display text-3xl leading-none gold-text tabular-nums">
                {countdown.days}
                <span className="ml-1.5 font-sans text-sm font-light text-white/40">
                  {countdown.days === 1 ? 'day' : 'days'}
                </span>
              </p>
              <p className="mt-2 text-[12px] text-white/40">
                {countdown.issue.label} · {countdown.issue.dateLabel}
              </p>
            </GlassCard>
          )
        }
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {issues.map((issue, i) => {
          const live = issue.status === 'live';
          const scheduled = issue.status === 'scheduled';
          const open = issue.id === openId;

          return (
            <GlassCard
              key={issue.id}
              interactive={!scheduled}
              sheen={live}
              glow={live}
              onClick={() => !scheduled && setOpenId(issue.id)}
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.5, delay: (i % 3) * 0.08, ease: [0.22, 1, 0.36, 1] }}
              className={cn('flex flex-col p-6', scheduled && 'opacity-60', open && !live && 'border-gold-500/30')}
            >
              <div className="flex items-start justify-between gap-3">
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-500">
                  {issue.label}
                </span>
                {live ? (
                  <LiveBadge tone="gold">Current</LiveBadge>
                ) : scheduled ? (
                  <Badge tone="neutral" icon={CalendarClock}>
                    Scheduled
                  </Badge>
                ) : (
                  <Badge tone="neutral">Archive</Badge>
                )}
              </div>

              <h3 className="mt-5 text-[17px] leading-snug">{issue.headline}</h3>
              <p className="mt-3 flex-1 text-[13.5px] leading-relaxed text-white/50">{issue.lede}</p>

              <div className="mt-5 flex flex-wrap gap-1.5">
                {issue.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md border border-white/[0.08] px-2 py-1 font-mono text-[9.5px] uppercase tracking-[0.12em] text-white/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/[0.06] pt-4">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
                  {issue.dateLabel} · {issue.readMinutes} min
                </span>
                {!scheduled && (
                  <span className="flex items-center gap-1.5 font-mono text-[10px] uppercase tracking-[0.14em] text-gold-400 transition-transform duration-300 group-hover/card:translate-x-0.5">
                    Read
                    <ArrowUpRight size={12} strokeWidth={2} aria-hidden />
                  </span>
                )}
              </div>
            </GlassCard>
          );
        })}
      </div>

      <GlassCard className="mt-6 flex flex-col items-start gap-5 p-6 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-gold-500/30 bg-gold-500/[0.07] text-gold-400">
            <Mail size={17} strokeWidth={1.6} aria-hidden />
          </span>
          <div>
            <p className="text-[14px] text-white">Delivered to every champion</p>
            <p className="mt-1 text-[12.5px] text-white/45">
              Each issue lands in your inbox the morning it publishes — no action needed.
            </p>
          </div>
        </div>
        <Badge tone="ok">Subscribed</Badge>
      </GlassCard>
    </section>
  );
}

function DocumentVault() {
  return (
    <section className="pt-28">
      <SectionHeading
        eyebrow="Quick access"
        title="Playbook & policy"
        highlight="policy"
        lede="The two documents every champion works from. Both download straight from the platform — no request, no gatekeeping."
      />

      <div className="mt-12 grid gap-5 lg:grid-cols-2">
        {vaultDocuments.map((doc, i) => {
          const Icon = DOC_ICON[doc.icon] || BookOpen;
          return (
            <GlassCard
              key={doc.id}
              sheen
              initial={{ opacity: 0, y: 22 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ duration: 0.55, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="flex flex-col p-7 md:p-8"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-gold-500/30 bg-gold-500/[0.07] text-gold-400">
                  <Icon size={19} strokeWidth={1.55} aria-hidden />
                </span>
                <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-gold-500">
                  {doc.kicker}
                </span>
              </div>

              <h3 className="mt-6 text-xl">{doc.title}</h3>
              <p className="mt-3.5 flex-1 text-[14px] leading-relaxed text-white/50">{doc.body}</p>

              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/[0.06] pt-6">
                <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/35">
                  {doc.meta}
                </span>
                <GoldButton
                  as="a"
                  href={doc.href}
                  download={doc.filename}
                  variant={i === 0 ? 'solid' : 'outline'}
                  icon={Download}
                >
                  Download
                </GoldButton>
              </div>
            </GlassCard>
          );
        })}
      </div>
    </section>
  );
}

function PolicyFrameworks() {
  return (
    <section className="pt-28">
      <SectionHeading
        eyebrow="Government frameworks"
        title="The rules you build inside"
        highlight="rules"
        lede="Champion projects sit inside a national policy envelope. These are the four documents that define it — read the governance policy for how they translate into our approval paths."
        aside={<Badge tone="gold" icon={Landmark}>{policyFrameworks.length} frameworks</Badge>}
      />

      <div className="mt-12 grid gap-4 md:grid-cols-2">
        {policyFrameworks.map((framework, i) => (
          <GlassCard
            key={framework.id}
            as="a"
            href={framework.href}
            target="_blank"
            rel="noreferrer noopener"
            interactive
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.5, delay: (i % 2) * 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="block p-6"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-gold-500">
                  {framework.issuer} · {framework.year}
                </p>
                <h3 className="mt-3 text-[16px] leading-snug">{framework.title}</h3>
              </div>
              <ExternalLink
                size={15}
                strokeWidth={1.7}
                aria-hidden
                className="mt-1 shrink-0 text-white/25 transition-colors duration-300 group-hover/card:text-gold-400"
              />
            </div>
            <p className="mt-3.5 text-[13.5px] leading-relaxed text-white/50">{framework.body}</p>
          </GlassCard>
        ))}
      </div>
    </section>
  );
}

export default function ResourceVault() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      className="pb-8 pt-10"
    >
      <NewsletterHub />
      <DocumentVault />
      <PolicyFrameworks />
    </motion.div>
  );
}
