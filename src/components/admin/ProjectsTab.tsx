"use client";

import type { BusinessUnit } from "@prisma/client";
import { FolderPlus, Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import type { AdminProject, SafeUser } from "@/components/admin/AdminPanel";
import { StageBadge } from "@/components/ui/StageBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";

export function ProjectsTab({
  projects,
  businessUnits,
  champions,
}: {
  projects: AdminProject[];
  businessUnits: BusinessUnit[];
  champions: SafeUser[];
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [businessUnitId, setBusinessUnitId] = useState("");
  const [championId, setChampionId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/projects", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name,
        description,
        businessUnitId,
        championId: championId || null,
      }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : "Failed to create project.");
      return;
    }

    setName("");
    setDescription("");
    setChampionId("");
    router.refresh();
  }

  async function reassignChampion(projectId: string, newChampionId: string) {
    setBusyId(projectId);
    await fetch(`/api/projects/${projectId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ championId: newChampionId || null }),
    });
    setBusyId(null);
    router.refresh();
  }

  const eligibleChampionsFor = (buId: string) => champions.filter((c) => c.businessUnitId === buId);

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={handleCreate} className="card space-y-3 p-5 lg:col-span-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
          <FolderPlus className="h-4 w-4 text-gold-500" />
          Create Project
        </h2>
        <div>
          <label className="label">Project name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            rows={3}
            className="input-field"
          />
        </div>
        <div>
          <label className="label">Business unit</label>
          <select
            value={businessUnitId}
            onChange={(e) => {
              setBusinessUnitId(e.target.value);
              setChampionId("");
            }}
            required
            className="input-field"
          >
            <option value="">Select a business unit</option>
            {businessUnits.map((bu) => (
              <option key={bu.id} value={bu.id}>
                {bu.name}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="label">Allocate to Champion (optional)</label>
          <select
            value={championId}
            onChange={(e) => setChampionId(e.target.value)}
            disabled={!businessUnitId}
            className="input-field"
          >
            <option value="">Unassigned</option>
            {eligibleChampionsFor(businessUnitId).map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-gold w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Project
        </button>
      </form>

      <div className="card p-5 lg:col-span-3">
        <h2 className="mb-4 text-sm font-semibold text-neutral-100">Projects ({projects.length})</h2>
        <div className="space-y-2">
          {projects.map((p) => (
            <div key={p.id} className="rounded-lg border border-surface-border px-3 py-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <Link href={`/projects/${p.id}`} className="text-sm font-medium text-neutral-100 hover:text-gold-400">
                    {p.name}
                  </Link>
                  <p className="text-xs text-neutral-600">{p.businessUnit.name}</p>
                </div>
                <div className="flex shrink-0 items-center gap-1.5">
                  <StageBadge stage={p.stage} />
                  <StatusBadge status={p.status} />
                </div>
              </div>
              <div className="mt-2">
                <select
                  disabled={busyId === p.id}
                  value={p.champion?.id ?? ""}
                  onChange={(e) => reassignChampion(p.id, e.target.value)}
                  className="input-field w-auto text-xs"
                >
                  <option value="">Unassigned</option>
                  {eligibleChampionsFor(p.businessUnitId).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ))}
          {projects.length === 0 && (
            <p className="py-6 text-center text-sm text-neutral-600">No projects created yet.</p>
          )}
        </div>
      </div>
    </div>
  );
}
