'use client';

import { useState } from 'react';
import type { Stage } from '@prisma/client';
import { ArrowRight, CheckCircle2, History, Send } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { Meter } from '@/components/ui/Meter';
import { StageRail } from '@/components/ui/StageRail';
import { EvidenceSection } from './EvidenceSection';
import type { TrackerEvidence, TrackerProject } from './types';
import { STAGES, stageIndex, stageMeta, stageProgress } from '@/lib/stages';
import { cn, formatDateTime, relativeDays } from '@/lib/utils';

export function ProjectTracker({ projects }: { projects: TrackerProject[] }) {
  const [items, setItems] = useState(projects);
  const [selectedId, setSelectedId] = useState(projects[0]!.id);

  const project = items.find((p) => p.id === selectedId) ?? items[0]!;

  const [stage, setStage] = useState<Stage>(project.stage);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [busy, setBusy] = useState(false);

  // Switching projects resets the form to that project's reality.
  const selectProject = (id: string) => {
    const next = items.find((p) => p.id === id);
    if (!next) return;
    setSelectedId(id);
    setStage(next.stage);
    setNote('');
    setError('');
    setSaved(false);
  };

  const stageChanged = stage !== project.stage;
  const currentMeta = stageMeta(stage);
  const originalMeta = stageMeta(project.stage);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setSaved(false);

    if (note.trim().length < 10) {
      setError('Add a short note describing what actually moved — at least 10 characters.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/projects/${project.id}/progress`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ stage, note: note.trim() }),
      });
      const data = (await res.json()) as {
        error?: string;
        update?: TrackerProject['updates'][number];
      };

      if (!res.ok || !data.update) {
        setError(data.error ?? 'Could not save the update.');
        return;
      }

      const update = data.update;
      setItems((prev) =>
        prev.map((p) =>
          p.id === project.id
            ? {
                ...p,
                stage: update.toStage,
                updatedAt: update.createdAt,
                updates: [update, ...p.updates],
              }
            : p,
        ),
      );
      setNote('');
      setSaved(true);
    } catch {
      setError('Could not reach the server. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  const onEvidenceAdded = (item: TrackerEvidence) => {
    setItems((prev) =>
      prev.map((p) => (p.id === project.id ? { ...p, evidence: [item, ...p.evidence] } : p)),
    );
  };

  return (
    <div className="space-y-6">
      {/* Project selector + status */}
      <Card className="p-6 md:p-7">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0 lg:max-w-md lg:flex-1">
            <label htmlFor="project-select" className="label">
              Assigned project
            </label>
            <select
              id="project-select"
              value={project.id}
              onChange={(e) => selectProject(e.target.value)}
              className="field cursor-pointer"
            >
              {items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} — {p.businessUnitName}
                </option>
              ))}
            </select>

            {project.summary && (
              <p className="mt-3 text-[13px] leading-relaxed text-ink-muted">{project.summary}</p>
            )}

            <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.13em] text-ink-faint">
              {project.championName ? `Champion: ${project.championName}` : 'Unassigned'} · updated{' '}
              {relativeDays(project.updatedAt)}
            </p>
          </div>

          <div className="w-full lg:max-w-sm">
            <Meter
              value={stageProgress(project.stage)}
              label="Pipeline progress"
              sublabel={`stage ${stageIndex(project.stage) + 1} of ${STAGES.length}`}
              color={stageMeta(project.stage).accent}
            />
            <StageRail stage={project.stage} className="mt-5" />
          </div>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        {/* Stage update */}
        <Card>
          <CardHeader
            eyebrow="Update progress"
            title="Move the project"
            description="Change the stage as reality changes, and say what moved. The note is what a reviewer reads."
          />

          <form onSubmit={submit} className="space-y-5 p-6">
            <div>
              <label htmlFor="stage-select" className="label">
                Stage
              </label>
              <select
                id="stage-select"
                value={stage}
                onChange={(e) => setStage(e.target.value as Stage)}
                className="field cursor-pointer"
              >
                {STAGES.map((s, i) => (
                  <option key={s.id} value={s.id}>
                    {i + 1}. {s.label}
                  </option>
                ))}
              </select>
              <p className="mt-2.5 text-[12.5px] leading-relaxed text-ink-faint">
                {currentMeta.blurb}
              </p>
            </div>

            {stageChanged && (
              <div className="flex flex-wrap items-center gap-3 rounded-xl border border-accent/25 bg-accent/[0.06] px-4 py-3">
                <span className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-ink-muted">
                  {originalMeta.short}
                </span>
                <ArrowRight size={14} strokeWidth={1.9} aria-hidden className="text-accent" />
                <span className="font-mono text-[10.5px] uppercase tracking-[0.13em] text-accent">
                  {currentMeta.short}
                </span>
                <span className="ml-auto text-[12px] text-ink-muted">
                  {stageIndex(stage) > stageIndex(project.stage) ? 'Advancing' : 'Stepping back'}
                </span>
              </div>
            )}

            <div>
              <label htmlFor="progress-note" className="label">
                What moved?
              </label>
              <textarea
                id="progress-note"
                rows={5}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="field resize-y leading-relaxed"
                placeholder="Be concrete — what works now that did not before, what is blocking you, and what you need."
              />
              <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.12em] text-ink-faint">
                {note.trim().length} characters
              </p>
            </div>

            {error && <Alert tone="error">{error}</Alert>}
            {saved && (
              <Alert tone="success">
                Update recorded. It is now visible on the executive dashboard.
              </Alert>
            )}

            <Button type="submit" icon={saved && !note ? CheckCircle2 : Send} loading={busy}>
              {stageChanged ? 'Save stage change' : 'Save update'}
            </Button>
          </form>
        </Card>

        {/* Evidence */}
        <Card>
          <CardHeader
            eyebrow="Evidence Section"
            title="Proof of work"
            description="Anything a reviewer can open and check: a working link, a repository, a screenshot of real output, or a measured result."
          />
          <div className="p-6">
            <EvidenceSection
              projectId={project.id}
              evidence={project.evidence}
              onAdded={onEvidenceAdded}
            />
          </div>
        </Card>
      </div>

      {/* History */}
      <Card>
        <CardHeader
          eyebrow="Progress trail"
          title="Update history"
          description="Every stage change on this project, newest first."
          action={<Badge tone="neutral">{project.updates.length} updates</Badge>}
        />

        <ol className="divide-y divide-line/50">
          {project.updates.map((update) => {
            const from = stageMeta(update.fromStage);
            const to = stageMeta(update.toStage);
            const moved = update.fromStage !== update.toStage;

            return (
              <li key={update.id} className="flex gap-4 p-6">
                <span
                  aria-hidden
                  className="mt-1 h-8 w-[3px] shrink-0 rounded-full"
                  style={{ backgroundColor: to.accent }}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                    <span className="font-mono text-[10px] uppercase tracking-[0.13em] text-ink-faint">
                      {formatDateTime(update.createdAt)} · {update.authorName}
                    </span>
                    {moved ? (
                      <Badge tone="accent">
                        {from.short} → {to.short}
                      </Badge>
                    ) : (
                      <Badge tone="neutral">{to.short}</Badge>
                    )}
                  </div>
                  <p className="mt-2.5 whitespace-pre-wrap text-[13.5px] leading-relaxed text-ink-muted">
                    {update.note}
                  </p>
                </div>
              </li>
            );
          })}

          {project.updates.length === 0 && (
            <li className={cn('px-6 py-10 text-center text-[13px] text-ink-faint')}>
              No updates recorded yet. The first one you save will appear here.
            </li>
          )}
        </ol>
      </Card>
    </div>
  );
}
