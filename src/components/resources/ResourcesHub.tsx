"use client";

import type { ResourceCategory } from "@prisma/client";
import { Download, FileText, Loader2, Trash2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { cn, formatBytes } from "@/lib/utils";

type Resource = {
  id: string;
  title: string;
  description: string | null;
  category: ResourceCategory;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  createdAt: Date;
  uploadedBy: { name: string };
};

const CATEGORIES: { key: ResourceCategory | "ALL"; label: string }[] = [
  { key: "ALL", label: "All" },
  { key: "PLAYBOOK", label: "Playbooks" },
  { key: "POLICY", label: "Policy Documents" },
  { key: "NEWSLETTER", label: "Newsletters" },
  { key: "OTHER", label: "Other" },
];

export function ResourcesHub({ resources, isAdmin }: { resources: Resource[]; isAdmin: boolean }) {
  const router = useRouter();
  const [filter, setFilter] = useState<ResourceCategory | "ALL">("ALL");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  const filtered = filter === "ALL" ? resources : resources.filter((r) => r.category === filter);

  async function handleUpload(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    setUploading(true);

    const formData = new FormData(e.currentTarget);
    const res = await fetch("/api/resources", { method: "POST", body: formData });

    setUploading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => null);
      setError(typeof body?.error === "string" ? body.error : "Upload failed.");
      return;
    }

    formRef.current?.reset();
    router.refresh();
  }

  async function remove(id: string) {
    if (!confirm("Delete this resource?")) return;
    setBusyId(id);
    await fetch(`/api/resources/${id}`, { method: "DELETE" });
    setBusyId(null);
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {isAdmin && (
        <form
          ref={formRef}
          onSubmit={handleUpload}
          className="card grid gap-3 p-5 md:grid-cols-2 lg:grid-cols-4"
        >
          <div className="lg:col-span-1">
            <label className="label">Title</label>
            <input name="title" required className="input-field" />
          </div>
          <div className="lg:col-span-1">
            <label className="label">Category</label>
            <select name="category" defaultValue="PLAYBOOK" className="input-field">
              <option value="PLAYBOOK">Playbook</option>
              <option value="POLICY">Policy</option>
              <option value="NEWSLETTER">Newsletter</option>
              <option value="OTHER">Other</option>
            </select>
          </div>
          <div className="lg:col-span-1">
            <label className="label">Description (optional)</label>
            <input name="description" className="input-field" />
          </div>
          <div className="lg:col-span-1">
            <label className="label">File</label>
            <input name="file" type="file" required className="input-field" />
          </div>
          <div className="md:col-span-2 lg:col-span-4">
            {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
            <button type="submit" disabled={uploading} className="btn-gold">
              {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadCloud className="h-4 w-4" />}
              Upload Resource
            </button>
          </div>
        </form>
      )}

      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition",
              filter === key
                ? "border-gold-500 bg-gold-500/10 text-gold-400"
                : "border-surface-border text-neutral-400 hover:text-neutral-200"
            )}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((r) => (
          <div key={r.id} className="card flex flex-col p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
                <FileText className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-neutral-100">{r.title}</p>
                <p className="text-xs text-neutral-600">{formatBytes(r.fileSize)} · {r.uploadedBy.name}</p>
              </div>
            </div>
            {r.description && <p className="mt-2 text-xs text-neutral-500">{r.description}</p>}
            <div className="mt-3 flex items-center gap-2">
              <a
                href={r.fileUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="btn-outline flex-1 text-xs"
              >
                <Download className="h-3.5 w-3.5" />
                Download
              </a>
              {isAdmin && (
                <button
                  disabled={busyId === r.id}
                  onClick={() => remove(r.id)}
                  className="rounded-lg border border-red-900/60 p-2 text-red-400 transition hover:bg-red-950/40"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-10 text-center text-sm text-neutral-600">
            No resources in this category yet.
          </p>
        )}
      </div>
    </div>
  );
}
