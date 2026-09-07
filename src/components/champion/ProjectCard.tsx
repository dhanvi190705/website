"use client";

import type { BusinessUnit, Evidence, Project } from "@prisma/client";
import { CheckCircle2, ChevronRight, FileText, Loader2, UploadCloud } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import { StageBadge } from "@/components/ui/StageBadge";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatBytes, STAGE_LABELS, STAGE_ORDER } from "@/lib/utils";

type ProjectWithExtras = Project & {
  businessUnit: BusinessUnit;
  evidence: Evidence[];
};

export function ProjectCard({ project }: { project: ProjectWithExtras }) {
  const router = useRouter();
  const [expanded, setExpanded] = useState(false);
  const [savingStage, setSavingStage] = useState(false);
  const [selectedStage, setSelectedStage] = useState(project.stage);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const descriptionRef = useRef<HTMLInputElement>(null);

  const currentIndex = STAGE_ORDER.indexOf(project.stage);

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
      setUploadMessage("Choose a file first.");
      return;
    }

    setUploading(true);
    setUploadMessage(null);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("description", descriptionRef.current?.value ?? "");

    const res = await fetch(`/api/projects/${project.id}/evidence`, {
      method: "POST",
      body: formData,
    });

    setUploading(false);

    if (res.ok) {
      setUploadMessage("Evidence uploaded.");
      if (fileInputRef.current) fileInputRef.current.value = "";
      if (descriptionRef.current) descriptionRef.current.value = "";
      router.refresh();
    } else {
      const body = await res.json().catch(() => null);
      setUploadMessage(body?.error ?? "Upload failed.");
    }
  }

  return (
    <div className="card p-5 animate-fade-in">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-semibold text-neutral-50">{project.name}</h3>
            <StatusBadge status={project.status} />
          </div>
          <p className="text-xs text-neutral-500">{project.businessUnit.name}</p>
        </div>
        <StageBadge stage={project.stage} />
      </div>

      <p className="mt-3 text-sm text-neutral-400">{project.description}</p>

      {/* Stage stepper */}
      <div className="mt-4 flex items-center gap-1">
        {STAGE_ORDER.map((stage, i) => (
          <div key={stage} className="flex flex-1 items-center gap-1">
            <div
              className={`h-1.5 flex-1 rounded-full ${
                i <= currentIndex ? "bg-gold-500" : "bg-surface-border"
              }`}
              title={STAGE_LABELS[stage]}
            />
          </div>
        ))}
      </div>
      <p className="mt-1 text-xs text-neutral-600">
        Stage {currentIndex + 1} of {STAGE_ORDER.length}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <select
          value={selectedStage}
          onChange={(e) => setSelectedStage(e.target.value as typeof project.stage)}
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
          placeholder="Optional note about this transition"
          className="input-field min-w-[180px] flex-1 text-xs"
        />
        <button
          onClick={submitStageChange}
          disabled={savingStage || selectedStage === project.stage}
          className="btn-gold text-xs"
        >
          {savingStage ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
          Update Stage
        </button>
      </div>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="mt-4 flex items-center gap-1 text-xs font-medium text-gold-500 hover:text-gold-400"
      >
        <ChevronRight className={`h-3.5 w-3.5 transition-transform ${expanded ? "rotate-90" : ""}`} />
        {expanded ? "Hide evidence upload" : "Upload evidence"}
      </button>

      {expanded && (
        <form onSubmit={submitEvidence} className="mt-3 space-y-2 rounded-lg border border-surface-border bg-surface-100/60 p-3">
          <div className="flex flex-wrap items-center gap-2">
            <input ref={fileInputRef} type="file" className="input-field flex-1 text-xs" />
            <input
              ref={descriptionRef}
              type="text"
              placeholder="Short description (optional)"
              className="input-field flex-1 text-xs"
            />
            <button type="submit" disabled={uploading} className="btn-outline text-xs">
              {uploading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <UploadCloud className="h-3.5 w-3.5" />}
              Upload
            </button>
          </div>
          {uploadMessage && <p className="text-xs text-neutral-400">{uploadMessage}</p>}
        </form>
      )}

      {project.evidence.length > 0 && (
        <div className="mt-4 space-y-1.5">
          <p className="text-xs font-medium text-neutral-500">Recent evidence</p>
          {project.evidence.map((ev) => (
            <a
              key={ev.id}
              href={ev.fileUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-xs text-neutral-400 hover:bg-surface-100 hover:text-gold-400"
            >
              <FileText className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{ev.fileName}</span>
              <span className="ml-auto shrink-0 text-neutral-600">{formatBytes(ev.fileSize)}</span>
            </a>
          ))}
        </div>
      )}

      <Link
        href={`/projects/${project.id}`}
        className="mt-4 inline-block text-xs font-medium text-neutral-500 hover:text-gold-400"
      >
        View full history →
      </Link>
    </div>
  );
}
