"use client";

import type { ProjectStage } from "@prisma/client";
import { CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { STAGE_LABELS, STAGE_ORDER } from "@/lib/utils";

export function ProjectActions({ project }: { project: { id: string; stage: ProjectStage } }) {
  const router = useRouter();
  const [selectedStage, setSelectedStage] = useState(project.stage);
  const [notes, setNotes] = useState("");
  const [savingStage, setSavingStage] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  async function submitStageChange() {
    if (selectedStage === project.stage) return;
    setSavingStage(true);
    await fetch(`/api/projects/${project.id}/stage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ toStage: selectedStage, notes: notes || undefined }),
    });
    setSavingStage(false);
    setNotes("");
    router.refresh();
  }

  async function submitEvidence(e: React.FormEvent) {
    e.preventDefault();
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage("Choose a file first.");
      return;
    }

    setUploading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", descriptionRef.current?.value ?? "");

    const res = await fetch(`/api/projects/${project.id}/evidence`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (res.ok) {
      setMessage("Evidence uploaded.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (descriptionRef.current) descriptionRef.current.value = "";
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setMessage(body?.error ?? "Upload failed.");
    }
  }

  return (
    <div className="card grid gap-4 p-5 md:grid-cols-2">
      <div>
        <p className="label">Progress Stage</p>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedStage}
            onChange={(e) => setSelectedStage(e.target.value as ProjectStage)}
            className="input-field w-auto text-xs"
          >
            {STAGE_ORDER.map((stage) => (
              <option key={stage} value={stage}>
                {STAGE_LABELS[stage]}
              </option>
            ))}
          </select>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional note"
            className="input-field min-w-[160px] flex-1 text-xs"
          />
          <button
            onClick={submitStageChange}
            disabled={savingStage || selectedStage === project.stage}
            className="btn-gold text-xs"
          >
            {savingStage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
            Update
          </button>
        </div>
      </div>

      <div>
        <p className="label">Upload Evidence</p>
        <form onSubmit={submitEvidence} className="flex flex-wrap items-center gap-2">
          <input ref={fileInputRef} type="file" className="input-field flex-1 text-xs" />
          <input
            ref={descriptionRef}
            type="text"
            placeholder="Description (optional)"
            className="input-field flex-1 text-xs"
          />
          <button type="submit" disabled={uploading} className="btn-outline text-xs">
            {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
            Upload
          </button>
        </form>
        {message && <p className="mt-1.5 text-xs text-neutral-500">{message}</p>}
      </div>
    </div>
  );
}
