'use client';

import { useRef, useState } from 'react';
import {
  ExternalLink,
  FileText,
  ImageIcon,
  Link2,
  Paperclip,
  Plus,
  UploadCloud,
} from 'lucide-react';
import { Alert } from '@/components/ui/Alert';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StageChip } from '@/components/ui/StageRail';
import type { TrackerEvidence } from './types';
import { cn, formatBytes, formatDate } from '@/lib/utils';

/**
 * The Evidence Section: proof of work as either an uploaded file or a link,
 * through one form rather than two competing widgets.
 */
export function EvidenceSection({
  projectId,
  evidence,
  onAdded,
}: {
  projectId: string;
  evidence: TrackerEvidence[];
  onAdded: (item: TrackerEvidence) => void;
}) {
  const [mode, setMode] = useState<'file' | 'link'>('file');
  const [label, setLabel] = useState('');
  const [note, setNote] = useState('');
  const [url, setUrl] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);

  const reset = () => {
    setLabel('');
    setNote('');
    setUrl('');
    setFile(null);
    if (inputRef.current) inputRef.current.value = '';
  };

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (label.trim().length < 2) {
      setError('Give the evidence a label so a reviewer knows what they are opening.');
      return;
    }
    if (mode === 'file' && !file) {
      setError('Choose a file, or switch to the link tab.');
      return;
    }
    if (mode === 'link' && !/^https?:\/\//i.test(url.trim())) {
      setError('Enter a full URL starting with http:// or https://');
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.set('label', label.trim());
      body.set('note', note.trim());
      if (mode === 'file' && file) body.set('file', file);
      if (mode === 'link') body.set('url', url.trim());

      const res = await fetch(`/api/projects/${projectId}/evidence`, { method: 'POST', body });
      const data = (await res.json()) as { error?: string; evidence?: TrackerEvidence };

      if (!res.ok || !data.evidence) {
        setError(data.error ?? 'Could not attach the evidence.');
        return;
      }

      onAdded(data.evidence);
      reset();
    } catch {
      setError('Could not reach the server. Try again in a moment.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="label mb-0">Evidence — proof of work</p>
        <Badge tone={evidence.length ? 'accent' : 'neutral'}>
          {evidence.length} attached
        </Badge>
      </div>

      <form onSubmit={submit} className="space-y-4">
        <div className="inline-flex rounded-lg border border-line bg-ground/60 p-1">
          {(['file', 'link'] as const).map((option) => (
            <button
              key={option}
              type="button"
              onClick={() => setMode(option)}
              aria-pressed={mode === option}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.13em] transition-colors duration-300',
                mode === option ? 'bg-accent-gradient text-ground' : 'text-ink-faint hover:text-accent',
              )}
            >
              {option === 'file' ? <Paperclip size={11} strokeWidth={2} /> : <Link2 size={11} strokeWidth={2} />}
              {option === 'file' ? 'Upload file' : 'Add link'}
            </button>
          ))}
        </div>

        <div>
          <label htmlFor="evidence-label" className="label">
            Label
          </label>
          <input
            id="evidence-label"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            className="field"
            placeholder="e.g. Accuracy run against 6 weeks of manual reports"
          />
        </div>

        {mode === 'file' ? (
          <div
            onDragEnter={(e) => {
              e.preventDefault();
              dragDepth.current += 1;
              setDragging(true);
            }}
            onDragOver={(e) => e.preventDefault()}
            onDragLeave={(e) => {
              e.preventDefault();
              dragDepth.current -= 1;
              if (dragDepth.current <= 0) setDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              dragDepth.current = 0;
              setDragging(false);
              const dropped = e.dataTransfer.files?.[0];
              if (dropped) setFile(dropped);
            }}
            className={cn(
              'rounded-xl border border-dashed p-6 text-center transition-colors duration-300',
              dragging ? 'border-accent bg-accent/[0.07]' : 'border-line hover:border-accent/40',
            )}
          >
            <UploadCloud size={20} strokeWidth={1.5} aria-hidden className="mx-auto text-accent" />
            <p className="mt-3 text-[13.5px] text-ink">
              {file ? file.name : dragging ? 'Release to attach' : 'Drop a file here'}
            </p>
            <p className="mt-1.5 text-[12px] text-ink-faint">
              {file
                ? formatBytes(file.size)
                : 'PNG, JPG, PDF, CSV, DOCX, XLSX, PPTX · up to 20 MB'}
            </p>

            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-4 rounded-lg border border-accent/40 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-accent transition-colors hover:bg-accent/10"
            >
              Browse files
            </button>

            <input
              ref={inputRef}
              type="file"
              className="sr-only"
              accept="image/*,.pdf,.csv,.txt,.md,.docx,.xlsx,.pptx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
          </div>
        ) : (
          <div>
            <label htmlFor="evidence-url" className="label">
              URL
            </label>
            <input
              id="evidence-url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="field"
              placeholder="https://dashboard.internal/... or a repository URL"
            />
          </div>
        )}

        <div>
          <label htmlFor="evidence-note" className="label">
            Note <span className="normal-case tracking-normal text-ink-faint">(optional)</span>
          </label>
          <textarea
            id="evidence-note"
            rows={2}
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="field resize-y"
            placeholder="What should a reviewer look at here?"
          />
        </div>

        {error && <Alert tone="error">{error}</Alert>}

        <Button type="submit" variant="outline" icon={Plus} loading={busy}>
          Attach evidence
        </Button>
      </form>

      <ul className="mt-6 space-y-2 border-t border-line/60 pt-5">
        {evidence.map((item) => {
          const Icon =
            item.kind === 'LINK'
              ? Link2
              : item.mimeType?.startsWith('image/')
                ? ImageIcon
                : FileText;
          const href = item.kind === 'LINK' ? item.url! : `/api/evidence/${item.id}/file`;

          return (
            <li key={item.id}>
              <a
                href={href}
                target="_blank"
                rel="noreferrer noopener"
                className="group flex items-center gap-3.5 rounded-xl border border-line/70 bg-ground/40 px-4 py-3 transition-colors duration-300 hover:border-accent/40"
              >
                <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-white/[0.03] text-accent">
                  <Icon size={15} strokeWidth={1.6} aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] text-ink">{item.label}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-[10px] uppercase tracking-[0.1em] text-ink-faint">
                    <StageChip stage={item.stage} />
                    <span>·</span>
                    <span>{item.uploadedByName}</span>
                    <span>·</span>
                    <span>{formatDate(item.createdAt)}</span>
                    {item.sizeBytes != null && (
                      <>
                        <span>·</span>
                        <span>{formatBytes(item.sizeBytes)}</span>
                      </>
                    )}
                  </span>
                </span>
                <ExternalLink
                  size={14}
                  strokeWidth={1.7}
                  aria-hidden
                  className="shrink-0 text-ink-faint transition-colors group-hover:text-accent"
                />
              </a>
              {item.note && (
                <p className="mt-1.5 pl-[3.35rem] text-[12.5px] leading-relaxed text-ink-muted">
                  {item.note}
                </p>
              )}
            </li>
          );
        })}

        {evidence.length === 0 && (
          <li className="rounded-xl border border-dashed border-line/70 px-4 py-6 text-center text-[13px] text-ink-faint">
            No evidence attached yet. A stage change should be backed by something a reviewer can open.
          </li>
        )}
      </ul>
    </div>
  );
}
