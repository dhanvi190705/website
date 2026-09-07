"use client";

import type { BusinessUnit } from "@prisma/client";
import { Building2, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";

import { cn } from "@/lib/utils";

export function BusinessUnitsTab({ businessUnits }: { businessUnits: BusinessUnit[] }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSubmitting(true);

    const res = await fetch("/api/business-units", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description: description || undefined }),
    });

    setSubmitting(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : "Failed to create business unit.");
      return;
    }

    setName("");
    setDescription("");
    router.refresh();
  }

  async function toggleActive(id: string, isActive: boolean) {
    setBusyId(id);
    await fetch(`/api/business-units/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-5">
      <form onSubmit={handleCreate} className="card space-y-3 p-5 lg:col-span-2">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-neutral-100">
          <Building2 className="h-4 w-4 text-gold-500" />
          Create Business Unit
        </h2>
        <div>
          <label className="label">Name</label>
          <input value={name} onChange={(e) => setName(e.target.value)} required className="input-field" />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            className="input-field"
          />
        </div>
        {error && <p className="text-xs text-red-400">{error}</p>}
        <button type="submit" disabled={submitting} className="btn-gold w-full">
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          Create Business Unit
        </button>
      </form>

      <div className="card p-5 lg:col-span-3">
        <h2 className="mb-4 text-sm font-semibold text-neutral-100">
          Business Units ({businessUnits.length})
        </h2>
        <div className="space-y-2">
          {businessUnits.map((bu) => (
            <div
              key={bu.id}
              className="flex items-center justify-between gap-3 rounded-lg border border-surface-border px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-medium text-neutral-100">{bu.name}</p>
                {bu.description && <p className="text-xs text-neutral-500">{bu.description}</p>}
              </div>
              <button
                disabled={busyId === bu.id}
                onClick={() => toggleActive(bu.id, bu.isActive)}
                className={cn(
                  "badge shrink-0",
                  bu.isActive
                    ? "border-emerald-800 bg-emerald-950/60 text-emerald-300"
                    : "border-red-900 bg-red-950/60 text-red-300"
                )}
              >
                {bu.isActive ? "Active" : "Inactive"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
