import { motion } from 'framer-motion';
import {
  Activity,
  AlertOctagon,
  Building2,
  CircleCheck,
  Flag,
  Layers,
  Trophy,
  Users,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import Badge from '../components/ui/Badge';
import { DistributionBar, DistributionRing } from '../components/ui/Distribution';
import GlassCard from '../components/ui/GlassCard';
import Meter from '../components/ui/Meter';
import SectionHeading from '../components/ui/SectionHeading';
import StatTile from '../components/ui/StatTile';
import { STAGES, stageById } from '../data/mockData';
import { attentionList, departmentHealth, programmeSummary, stageDistribution } from '../lib/analytics';
import { cn, formatDate, relativeDays } from '../lib/utils';

const SEVERITY_TONE = { high: 'risk', medium: 'warn', low: 'neutral' };

function ReviewQueue({ queue, projects }) {
  return (
    <GlassCard className="p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          <Flag size={12} strokeWidth={1.9} aria-hidden />
          Pending review flags
        </p>
        <Badge tone={queue.length ? 'warn' : 'ok'}>{queue.length} open</Badge>
      </div>

      <ul className="mt-5 space-y-2.5">
        {queue.map((item) => {
          const project = projects.find((p) => p.id === item.projectId);
          if (!project) return null;
          return (
            <li
              key={item.id}
              className="group flex items-start gap-3.5 rounded-xl border border-white/[0.06] bg-ink-soft/40 p-4 transition-colors duration-300 hover:border-white/[0.12]"
            >
              <span
                aria-hidden
                className={cn(
                  'mt-1.5 h-2 w-2 shrink-0 rounded-full',
                  item.severity === 'high'
                    ? 'bg-signal-risk'
                    : item.severity === 'medium'
                      ? 'bg-signal-warn'
                      : 'bg-white/25',
                )}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13.5px] text-white">{project.name}</p>
                <p className="mt-1 text-[12px] leading-relaxed text-white/45">{item.reason}</p>
                <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
                  {project.deptCode} · {project.owner} · open {item.age} days
                </p>
              </div>
              <Badge tone={SEVERITY_TONE[item.severity]} className="shrink-0">
                {item.severity}
              </Badge>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

function DepartmentHealth({ rows }) {
  return (
    <GlassCard className="p-7">
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          <Activity size={12} strokeWidth={1.9} aria-hidden />
          Department health
        </p>
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
          Lowest first
        </span>
      </div>

      <div className="mt-6 space-y-5">
        {rows.map((row, i) => (
          <motion.div
            key={row.code}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.45, delay: i * 0.05, ease: [0.22, 1, 0.36, 1] }}
          >
            <Meter
              value={row.score}
              label={row.name}
              sublabel={`${row.projects} ${row.projects === 1 ? 'project' : 'projects'}${row.pending ? ` · ${row.pending} flagged` : ''}`}
            />
          </motion.div>
        ))}
      </div>
    </GlassCard>
  );
}

function AttentionList({ items }) {
  return (
    <GlassCard className="p-7">
      <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
        <AlertOctagon size={12} strokeWidth={1.9} aria-hidden />
        Needs a nudge
      </p>

      <ul className="mt-5 divide-y divide-white/[0.05]">
        {items.map((project) => {
          const stage = stageById(project.stage);
          return (
            <li key={project.id} className="flex items-center gap-4 py-3.5 first:pt-0 last:pb-0">
              <span
                aria-hidden
                className="h-7 w-[3px] shrink-0 rounded-full"
                style={{ backgroundColor: stage.accent }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] text-white/85">{project.name}</p>
                <p className="mt-0.5 font-mono text-[10px] uppercase tracking-[0.13em] text-white/30">
                  {project.deptCode} · {stage.short} · last moved {relativeDays(project.updatedAt)}
                </p>
              </div>
              <span className="shrink-0 font-mono text-[11px] tabular-nums text-white/45">
                {project.health}
              </span>
            </li>
          );
        })}
      </ul>
    </GlassCard>
  );
}

export default function ExecutiveDashboard({ dashboard }) {
  const { projects = [], departments = [], champions = [], reviewQueue = [] } = dashboard || {};
  const [deptFilter, setDeptFilter] = useState('all');

  const filtered = useMemo(
    () => (deptFilter === 'all' ? projects : projects.filter((p) => p.deptCode === deptFilter)),
    [projects, deptFilter],
  );

  const summary = useMemo(() => programmeSummary(filtered, champions), [filtered, champions]);
  const distribution = useMemo(() => stageDistribution(filtered), [filtered]);
  const deptRows = useMemo(() => departmentHealth(projects, departments), [projects, departments]);
  const attention = useMemo(() => attentionList(filtered), [filtered]);

  // Only departments that actually run projects are worth filtering by.
  const filterOptions = useMemo(
    () => departments.filter((d) => projects.some((p) => p.deptCode === d.code)),
    [departments, projects],
  );

  if (!projects.length) {
    return <div className="py-24 text-center text-white/40">Loading programme data…</div>;
  }

  return (
    <div className="pb-8 pt-10">
      <SectionHeading
        eyebrow="Master view"
        title="Executive Dashboard"
        highlight="Executive"
        lede="Every champion project in one place: where the pipeline is bunching, which departments need help, and what is waiting on a decision."
        aside={
          <div className="flex items-center gap-2.5">
            <label htmlFor="dept-filter" className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
              Department
            </label>
            <select
              id="dept-filter"
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="field w-auto cursor-pointer py-2.5 pr-9 font-mono text-[11px] uppercase tracking-[0.12em]"
            >
              <option value="all">All ({projects.length})</option>
              {filterOptions.map((d) => (
                <option key={d.code} value={d.code}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
        }
      />

      {/* Headline figures */}
      <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.06] lg:grid-cols-4">
        {[
          { value: summary.totalProjects, label: 'Active projects', hint: `across ${summary.departments} departments`, icon: Layers },
          { value: summary.milestones, label: 'Milestones cleared', hint: 'cumulative, all champions', icon: Trophy },
          { value: summary.avgHealth, label: 'Aggregate health', hint: summary.healthBand.label, icon: Activity },
          { value: summary.pendingReview, label: 'Pending review', hint: `${summary.stale} untouched for 14+ days`, icon: Flag, tone: 'plain' },
        ].map((stat) => (
          <div key={stat.label} className="bg-charcoal/80 p-6 backdrop-blur-xl md:p-7">
            <StatTile {...stat} />
          </div>
        ))}
      </div>

      {/* Distribution + roster */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <GlassCard className="p-7 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              Stage distribution
            </p>
            <Badge tone="neutral">
              {summary.shippedShare}% at production or beyond
            </Badge>
          </div>

          <DistributionRing
            segments={distribution}
            total={filtered.length}
            centerLabel={deptFilter === 'all' ? 'Total projects' : `${deptFilter} projects`}
            className="mt-8"
          />

          <div className="mt-9 border-t border-white/[0.06] pt-7">
            <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              Pipeline weight
            </p>
            <DistributionBar segments={distribution} />
          </div>
        </GlassCard>

        <div className="space-y-6">
          <GlassCard className="p-7">
            <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
              <Users size={12} strokeWidth={1.9} aria-hidden />
              The cohort
            </p>

            <div className="mt-6 grid grid-cols-2 gap-5">
              <StatTile value={summary.totalChampions} label="Champions" icon={Users} />
              <StatTile value={summary.totalSpecialists} label="Specialists" icon={CircleCheck} tone="plain" />
              <StatTile value={summary.departments} label="Departments" icon={Building2} tone="plain" />
              <StatTile value={summary.shipped} label="In production" icon={Trophy} />
            </div>

            <div className="mt-7 border-t border-white/[0.06] pt-6">
              <Meter
                value={summary.avgHealth}
                label="Programme health"
                sublabel={`${filtered.length} projects in scope`}
              />
            </div>
          </GlassCard>

          <AttentionList items={attention} />
        </div>
      </div>

      {/* Health + queue */}
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <DepartmentHealth rows={deptRows} />
        <ReviewQueue queue={reviewQueue} projects={projects} />
      </div>

      {/* Full roster table — the fallback view for anything the charts compress. */}
      <GlassCard className="mt-6 p-7">
        <div className="flex items-center justify-between gap-4">
          <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
            All projects
          </p>
          <Badge tone="neutral">{filtered.length} rows</Badge>
        </div>

        <div className="mt-5 -mx-2 overflow-x-auto px-2">
          <table className="w-full min-w-[720px] border-collapse text-left">
            <thead>
              <tr className="border-b border-white/[0.08]">
                {['Project', 'Dept', 'Owner', 'Stage', 'Health', 'Milestones', 'Updated'].map((head) => (
                  <th
                    key={head}
                    scope="col"
                    className="whitespace-nowrap pb-3 pr-5 font-mono text-[9.5px] uppercase tracking-[0.16em] font-normal text-white/35"
                  >
                    {head}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((project) => {
                const stage = stageById(project.stage);
                return (
                  <tr
                    key={project.id}
                    className="border-b border-white/[0.04] transition-colors duration-200 last:border-0 hover:bg-white/[0.025]"
                  >
                    <td className="max-w-[300px] truncate py-3 pr-5 text-[13px] text-white/85">
                      {project.name}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-5 font-mono text-[11px] text-white/45">
                      {project.deptCode}
                    </td>
                    <td className="max-w-[160px] truncate py-3 pr-5 text-[12.5px] text-white/50">
                      {project.owner}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-5">
                      <span className="inline-flex items-center gap-2 font-mono text-[10.5px] uppercase tracking-[0.12em] text-white/70">
                        <span
                          aria-hidden
                          className="h-1.5 w-1.5 rounded-full"
                          style={{ backgroundColor: stage.accent }}
                        />
                        {stage.short}
                      </span>
                    </td>
                    <td className="py-3 pr-5 font-mono text-[12px] tabular-nums text-white/80">
                      {project.health}
                    </td>
                    <td className="py-3 pr-5 font-mono text-[12px] tabular-nums text-white/50">
                      {project.milestonesCleared}/5
                    </td>
                    <td className="whitespace-nowrap py-3 pr-2 font-mono text-[11px] text-white/35">
                      {formatDate(project.updatedAt)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
          Stage colours run light to bright along the pipeline — {STAGES.map((s) => s.short).join(' → ')}
        </p>
      </GlassCard>
    </div>
  );
}
