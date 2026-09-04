import {
  Activity,
  AlertOctagon,
  BarChart3,
  Building2,
  CheckCircle2,
  Layers,
  TimerOff,
} from 'lucide-react';
import { Role } from '@prisma/client';
import { Badge } from '@/components/ui/Badge';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Meter } from '@/components/ui/Meter';
import { StatTile } from '@/components/ui/StatTile';
import { StageChip } from '@/components/ui/StageRail';
import { StageDistribution } from '@/components/dashboard/StageDistribution';
import { PageHeader } from '@/components/layout/PageHeader';
import {
  bottlenecks,
  businessUnitBreakdown,
  portfolioSummary,
  stageDistribution,
  STALL_DAYS,
  type ProjectRow,
} from '@/lib/analytics';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';
import { stageProgress } from '@/lib/stages';
import { cn, daysSince, formatDate, relativeDays } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Executive Dashboard · AI.Next Portal' };

const SEVERITY = {
  high: { tone: 'risk', dot: 'bg-risk' },
  medium: { tone: 'warn', dot: 'bg-warn' },
  low: { tone: 'neutral', dot: 'bg-ink-faint' },
} as const;

/** Aggregate progress across every initiative — AI/Tech Team only. */
export default async function DashboardPage() {
  await requireRole(Role.TECH_TEAM);

  const projects = await prisma.project.findMany({
    orderBy: { updatedAt: 'desc' },
    include: {
      businessUnit: { select: { name: true } },
      champion: { select: { name: true } },
      _count: { select: { updates: true, evidence: true } },
    },
  });

  const rows: ProjectRow[] = projects.map((project) => ({
    id: project.id,
    name: project.name,
    stage: project.stage,
    businessUnitName: project.businessUnit.name,
    championName: project.champion?.name ?? null,
    updatedAt: project.updatedAt.toISOString(),
    updateCount: project._count.updates,
    evidenceCount: project._count.evidence,
  }));

  const summary = portfolioSummary(rows);
  const slices = stageDistribution(rows);
  const findings = bottlenecks(rows);
  const units = businessUnitBreakdown(rows);

  if (rows.length === 0) {
    return (
      <>
        <PageHeader
          eyebrow="Executive Dashboard"
          title="Portfolio health across every initiative"
          description="Aggregate progress, stage distribution and bottlenecks — as soon as there are projects to report on."
        />
        <Card>
          <EmptyState
            icon={BarChart3}
            title="No projects yet"
            description="Create business units and projects from the Projects screen, then assign each one to a champion. This dashboard fills in as they record progress."
          />
        </Card>
      </>
    );
  }

  return (
    <>
      <PageHeader
        eyebrow="Executive Dashboard"
        title="Portfolio health across every initiative"
        description="Where the pipeline is bunching, which business units need help, and what has gone quiet."
        action={<Badge tone="neutral">{summary.total} projects · {summary.businessUnits} units</Badge>}
      />

      {/* Headline figures */}
      <div className="mb-6 grid grid-cols-2 gap-px overflow-hidden rounded-card border border-line/70 bg-line/70 lg:grid-cols-4">
        {[
          { value: summary.total, label: 'Active projects', hint: `across ${summary.businessUnits} business units`, icon: Layers },
          { value: `${summary.averageProgress}%`, label: 'Average progress', hint: 'mean position in the pipeline', icon: Activity },
          { value: summary.inAdoption, label: 'In full adoption', hint: 'reached stage 5', icon: CheckCircle2 },
          { value: summary.stalled, label: 'Stalled', hint: `no update in ${STALL_DAYS}+ days`, icon: TimerOff, accent: false },
        ].map((stat) => (
          <div key={stat.label} className="bg-surface/85">
            <StatTile {...stat} />
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        {/* Distribution */}
        <Card>
          <CardHeader
            eyebrow="Stage distribution"
            title="Where the portfolio sits"
            description="Counts per pipeline stage. Hover a segment to isolate it."
          />
          <div className="p-6 md:p-7">
            <StageDistribution slices={slices} total={rows.length} />
          </div>
        </Card>

        {/* Bottlenecks */}
        <Card>
          <CardHeader
            eyebrow="Bottlenecks"
            title="What needs attention"
            description="Signals worth acting on, most serious first."
            action={<Badge tone={findings.length ? 'warn' : 'ok'}>{findings.length} flagged</Badge>}
          />

          {findings.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Nothing flagged"
              description="No stage pile-ups, no stalled projects, and every project past Ideation has evidence attached."
            />
          ) : (
            <ul className="divide-y divide-line/50">
              {findings.map((finding) => (
                <li key={finding.id} className="flex gap-3.5 p-5">
                  <span
                    aria-hidden
                    className={cn('mt-1.5 h-2 w-2 shrink-0 rounded-full', SEVERITY[finding.severity].dot)}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] text-ink">{finding.title}</p>
                    <p className="mt-1.5 text-[12.5px] leading-relaxed text-ink-muted">
                      {finding.detail}
                    </p>
                  </div>
                  <Badge tone={SEVERITY[finding.severity].tone} className="shrink-0">
                    {finding.severity}
                  </Badge>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {/* Business units */}
      <Card className="mt-6">
        <CardHeader
          eyebrow="By business unit"
          title="Average pipeline progress"
          description="Ordered weakest first — the units most likely to need support."
          action={<Badge tone="neutral" icon={Building2}>{units.length} units</Badge>}
        />
        <div className="space-y-5 p-6 md:p-7">
          {units.map((unit) => (
            <Meter
              key={unit.name}
              value={unit.progress}
              label={unit.name}
              sublabel={`${unit.projects} project${unit.projects === 1 ? '' : 's'}${
                unit.stalled ? ` · ${unit.stalled} stalled` : ''
              }`}
            />
          ))}
        </div>
      </Card>

      {/* Full table */}
      <Card className="mt-6">
        <CardHeader
          eyebrow="Every initiative"
          title="Project register"
          description="The full portfolio — the fallback view for anything the charts compress."
          action={
            summary.unassigned ? (
              <Badge tone="warn" icon={AlertOctagon}>
                {summary.unassigned} unassigned
              </Badge>
            ) : undefined
          }
        />

        <div className="overflow-x-auto p-6">
          <table className="w-full min-w-[820px] border-collapse text-left">
            <thead>
              <tr className="border-b border-line/70">
                {['Project', 'Business unit', 'Champion', 'Stage', 'Progress', 'Evidence', 'Last update'].map(
                  (heading) => (
                    <th
                      key={heading}
                      scope="col"
                      className="whitespace-nowrap pb-3 pr-5 font-mono text-[9.5px] font-normal uppercase tracking-[0.15em] text-ink-faint"
                    >
                      {heading}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => {
                const stalled = daysSince(row.updatedAt) >= STALL_DAYS;
                return (
                  <tr
                    key={row.id}
                    className="border-b border-line/40 transition-colors last:border-0 hover:bg-white/[0.02]"
                  >
                    <td className="max-w-[280px] truncate py-3 pr-5 text-[13px] text-ink">
                      {row.name}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-5 text-[12.5px] text-ink-muted">
                      {row.businessUnitName}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-5 text-[12.5px] text-ink-muted">
                      {row.championName ?? (
                        <span className="text-warn">Unassigned</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-5">
                      <StageChip stage={row.stage} />
                    </td>
                    <td className="py-3 pr-5 font-mono text-[12px] tabular-nums text-ink">
                      {stageProgress(row.stage)}%
                    </td>
                    <td className="py-3 pr-5 font-mono text-[12px] tabular-nums text-ink-muted">
                      {row.evidenceCount === 0 ? (
                        <span className="text-warn">none</span>
                      ) : (
                        row.evidenceCount
                      )}
                    </td>
                    <td className="whitespace-nowrap py-3 pr-2 font-mono text-[11px] text-ink-faint">
                      <span className={stalled ? 'text-warn' : undefined} title={formatDate(row.updatedAt)}>
                        {relativeDays(row.updatedAt)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </>
  );
}
