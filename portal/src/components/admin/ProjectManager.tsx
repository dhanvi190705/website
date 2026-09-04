'use client';

import { useState } from 'react';
import type { Stage } from '@prisma/client';
import { FolderPlus, SquareKanban } from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card, CardHeader } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { StageChip } from '@/components/ui/StageRail';
import { relativeDays } from '@/lib/utils';

export type AdminProject = {
  id: string;
  name: string;
  summary: string | null;
  stage: Stage;
  businessUnitName: string;
  championId: string | null;
  championName: string | null;
  updatedAt: string;
};

export type ChampionOption = { id: string; name: string; businessUnitName: string | null };
export type UnitOption = { id: string; name: string };

export function ProjectManager({
  initialProjects,
  units,
  champions,
}: {
  initialProjects: AdminProject[];
  units: UnitOption[];
  champions: ChampionOption[];
}) {
  const [projects, setProjects] = useState(initialProjects);
  const [form, setForm] = useState({ name: '', summary: '', businessUnitId: '', championId: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!form.businessUnitId) {
      setError('Select a business unit.');
      return;
    }

    setBusy(true);
    try {
      const res = await fetch('/api/admin/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name.trim(),
          summary: form.summary.trim() || null,
          businessUnitId: form.businessUnitId,
          championId: form.championId || null,
        }),
      });
      const data = (await res.json()) as { error?: string; project?: AdminProject };
      if (!res.ok || !data.project) {
        setError(data.error ?? 'Could not create the project.');
        return;
      }
      setProjects((prev) => [data.project!, ...prev]);
      setForm({ name: '', summary: '', businessUnitId: '', championId: '' });
    } catch {
      setError('Could not reach the server.');
    } finally {
      setBusy(false);
    }
  };

  const assign = async (projectId: string, championId: string) => {
    const res = await fetch('/api/admin/projects', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: projectId, championId: championId || null }),
    });
    const data = (await res.json()) as {
      error?: string;
      championId?: string | null;
      championName?: string | null;
    };
    if (!res.ok) {
      setError(data.error ?? 'Could not assign the project.');
      return;
    }
    setProjects((prev) =>
      prev.map((p) =>
        p.id === projectId
          ? { ...p, championId: data.championId ?? null, championName: data.championName ?? null }
          : p,
      ),
    );
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.5fr)]">
      <Card>
        <CardHeader
          eyebrow="New initiative"
          title="Create a project"
          description="Projects belong to a business unit. Assign a champion now or later."
        />
        <form onSubmit={create} className="space-y-4 p-6">
          <div>
            <label htmlFor="project-name" className="label">
              Project name
            </label>
            <input
              id="project-name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="field"
              required
            />
          </div>

          <div>
            <label htmlFor="project-summary" className="label">
              Summary <span className="normal-case tracking-normal text-ink-faint">(optional)</span>
            </label>
            <textarea
              id="project-summary"
              rows={3}
              value={form.summary}
              onChange={(e) => setForm({ ...form, summary: e.target.value })}
              className="field resize-y"
              placeholder="What problem does this solve, and for whom?"
            />
          </div>

          <div>
            <label htmlFor="project-unit" className="label">
              Business unit
            </label>
            <select
              id="project-unit"
              value={form.businessUnitId}
              onChange={(e) => setForm({ ...form, businessUnitId: e.target.value })}
              className="field cursor-pointer"
              required
            >
              <option value="">Select a unit…</option>
              {units.map((unit) => (
                <option key={unit.id} value={unit.id}>
                  {unit.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="project-champion" className="label">
              Champion <span className="normal-case tracking-normal text-ink-faint">(optional)</span>
            </label>
            <select
              id="project-champion"
              value={form.championId}
              onChange={(e) => setForm({ ...form, championId: e.target.value })}
              className="field cursor-pointer"
            >
              <option value="">Assign later…</option>
              {champions.map((champion) => (
                <option key={champion.id} value={champion.id}>
                  {champion.name}
                  {champion.businessUnitName ? ` — ${champion.businessUnitName}` : ''}
                </option>
              ))}
            </select>
          </div>

          {units.length === 0 && (
            <Alert tone="info">
              Create a business unit on the Users screen first — a project cannot exist without one.
            </Alert>
          )}

          {error && <Alert tone="error">{error}</Alert>}

          <Button type="submit" icon={FolderPlus} loading={busy} disabled={units.length === 0}>
            Create project
          </Button>
        </form>
      </Card>

      <Card>
        <CardHeader
          eyebrow="Portfolio"
          title="All projects"
          description="Reassign a champion at any time — the progress trail stays with the project."
          action={<Badge tone="neutral">{projects.length} projects</Badge>}
        />

        {projects.length === 0 ? (
          <EmptyState
            icon={SquareKanban}
            title="No projects yet"
            description="Create the first initiative using the form on the left."
          />
        ) : (
          <ul className="divide-y divide-line/50">
            {projects.map((project) => (
              <li key={project.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-[13.5px] text-ink">{project.name}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.11em] text-ink-faint">
                      {project.businessUnitName} · updated {relativeDays(project.updatedAt)}
                    </p>
                  </div>
                  <StageChip stage={project.stage} />
                </div>

                <div className="mt-3.5">
                  <label htmlFor={`assign-${project.id}`} className="sr-only">
                    Champion for {project.name}
                  </label>
                  <select
                    id={`assign-${project.id}`}
                    value={project.championId ?? ''}
                    onChange={(e) => void assign(project.id, e.target.value)}
                    className="field cursor-pointer py-2 text-[12.5px]"
                  >
                    <option value="">Unassigned</option>
                    {champions.map((champion) => (
                      <option key={champion.id} value={champion.id}>
                        {champion.name}
                        {champion.businessUnitName ? ` — ${champion.businessUnitName}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
}
