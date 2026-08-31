import { AnimatePresence, motion } from 'framer-motion';
import {
  FileText,
  Github,
  ImageIcon,
  Link2,
  Paperclip,
  Plus,
  Trash2,
  UploadCloud,
} from 'lucide-react';
import { useCallback, useRef, useState } from 'react';
import Badge from '../ui/Badge';
import { PROOF_KINDS } from '../../data/mockData';
import { cn, formatBytes, formatDate, uid } from '../../lib/utils';

const KIND_ICON = { link: Link2, repo: Github, screenshot: ImageIcon, document: FileText };

/** Infer the proof kind from a dropped file's MIME type. */
function kindForFile(file) {
  if (file.type.startsWith('image/')) return 'screenshot';
  return 'document';
}

/** Infer the proof kind from a pasted URL. */
function kindForUrl(url) {
  return /github\.com|gitlab\.|bitbucket\.|\.git$/i.test(url) ? 'repo' : 'link';
}

/**
 * Proof of work — the one place a champion attaches evidence.
 *
 * Accepts three things without three separate widgets: files dropped or picked,
 * a pasted link, and a repository remote. Files are held in memory as object
 * URLs for the MVP; the same `onChange` payload is what POST /api/proofs takes,
 * so swapping in real upload is a change of transport, not of interface.
 */
export default function ProofDropzone({ proofs, onChange, disabled = false }) {
  const [dragging, setDragging] = useState(false);
  const [linkValue, setLinkValue] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const dragDepth = useRef(0); // Child elements fire dragleave; count to stay accurate.

  const addFiles = useCallback(
    (fileList) => {
      const files = Array.from(fileList || []);
      if (!files.length) return;

      const tooBig = files.filter((f) => f.size > 15 * 1024 * 1024);
      if (tooBig.length) {
        setError(`${tooBig[0].name} is over the 15 MB limit — link to it instead.`);
      }

      const accepted = files
        .filter((f) => f.size <= 15 * 1024 * 1024)
        .map((file) => ({
          id: uid('proof'),
          kind: kindForFile(file),
          name: file.name,
          detail: file.type || 'File',
          size: file.size,
          addedAt: new Date().toISOString().slice(0, 10),
          previewUrl: file.type.startsWith('image/') ? URL.createObjectURL(file) : null,
        }));

      if (accepted.length) {
        setError('');
        onChange([...proofs, ...accepted]);
      }
    },
    [onChange, proofs],
  );

  const addLink = () => {
    const value = linkValue.trim();
    if (!value) return;
    if (!/^(https?:\/\/|git@)/i.test(value)) {
      setError('Enter a full URL (https://…) or a git remote (git@…).');
      return;
    }
    setError('');
    onChange([
      ...proofs,
      {
        id: uid('proof'),
        kind: kindForUrl(value),
        name: value.replace(/^https?:\/\//, '').split('/').slice(0, 2).join('/'),
        detail: value,
        size: null,
        addedAt: new Date().toISOString().slice(0, 10),
      },
    ]);
    setLinkValue('');
  };

  const remove = (id) => {
    const target = proofs.find((p) => p.id === id);
    if (target?.previewUrl) URL.revokeObjectURL(target.previewUrl);
    onChange(proofs.filter((p) => p.id !== id));
  };

  return (
    <div>
      {/* Dropzone */}
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
          if (!disabled) addFiles(e.dataTransfer.files);
        }}
        className={cn(
          'relative overflow-hidden rounded-2xl border border-dashed p-8 text-center transition-all duration-400 ease-premium',
          dragging
            ? 'border-gold-400 bg-gold-500/[0.08] shadow-gold'
            : 'border-white/12 bg-ink-soft/50 hover:border-gold-500/40',
          disabled && 'pointer-events-none opacity-50',
        )}
      >
        <AnimatePresence>
          {dragging && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.16),transparent_65%)]"
            />
          )}
        </AnimatePresence>

        <motion.div
          animate={dragging ? { y: -4, scale: 1.06 } : { y: 0, scale: 1 }}
          transition={{ type: 'spring', stiffness: 320, damping: 22 }}
          className="relative mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-gold-500/30 bg-charcoal"
        >
          <UploadCloud size={22} strokeWidth={1.5} className="text-gold-400" aria-hidden />
        </motion.div>

        <p className="relative mt-5 text-[15px] text-white">
          {dragging ? 'Release to attach' : 'Drop your proof of work here'}
        </p>
        <p className="relative mx-auto mt-2 max-w-md text-[13px] leading-relaxed text-white/45">
          Screenshots, accuracy reports, spec documents — or paste a live link or repository below.
          Anything a reviewer can open and check.
        </p>

        <div className="relative mt-6 flex flex-wrap items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className="inline-flex items-center gap-2 rounded-xl border border-gold-500/40 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.16em] text-gold-300 transition-colors duration-300 hover:border-gold-400 hover:bg-gold-500/10"
          >
            <Paperclip size={13} strokeWidth={1.8} aria-hidden />
            Browse files
          </button>
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
            PNG · JPG · PDF · up to 15 MB
          </span>
        </div>

        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/*,.pdf,.doc,.docx,.csv,.xlsx,.md,.txt"
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = ''; // Allow re-picking the same file.
          }}
        />
      </div>

      {/* Link / repo entry */}
      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <Link2
            size={15}
            strokeWidth={1.7}
            aria-hidden
            className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            value={linkValue}
            disabled={disabled}
            onChange={(e) => setLinkValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                addLink();
              }
            }}
            placeholder="https://dashboard.internal/… or git@internal:team/repo.git"
            aria-label="Add a link or repository as proof"
            className="field pl-11"
          />
        </div>
        <button
          type="button"
          onClick={addLink}
          disabled={disabled || !linkValue.trim()}
          className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.16em] text-white/70 transition-colors duration-300 hover:border-gold-500/40 hover:text-gold-300 disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Plus size={13} strokeWidth={2} aria-hidden />
          Attach
        </button>
      </div>

      {error && (
        <p role="alert" className="mt-2.5 text-[12px] text-signal-risk">
          {error}
        </p>
      )}

      {/* Attached list */}
      <div className="mt-5 flex items-center justify-between">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Attached proof
        </p>
        <Badge tone={proofs.length ? 'gold' : 'neutral'}>
          {proofs.length} {proofs.length === 1 ? 'item' : 'items'}
        </Badge>
      </div>

      <ul className="mt-3 space-y-2">
        <AnimatePresence initial={false}>
          {proofs.map((proof) => {
            const Icon = KIND_ICON[proof.kind] || FileText;
            const kind = PROOF_KINDS.find((k) => k.id === proof.kind);
            return (
              <motion.li
                key={proof.id}
                layout
                initial={{ opacity: 0, y: -6, height: 0 }}
                animate={{ opacity: 1, y: 0, height: 'auto' }}
                exit={{ opacity: 0, x: -12, height: 0 }}
                transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                className="group flex items-center gap-3.5 overflow-hidden rounded-xl border border-white/[0.07] bg-charcoal/60 px-4 py-3"
              >
                {proof.previewUrl ? (
                  <img
                    src={proof.previewUrl}
                    alt=""
                    className="h-9 w-9 shrink-0 rounded-lg border border-white/10 object-cover"
                  />
                ) : (
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-gold-400">
                    <Icon size={15} strokeWidth={1.6} aria-hidden />
                  </span>
                )}

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[13.5px] text-white">{proof.name}</span>
                  <span className="block truncate font-mono text-[10.5px] uppercase tracking-[0.1em] text-white/35">
                    {kind?.label || proof.kind}
                    {proof.size ? ` · ${formatBytes(proof.size)}` : ''} · {formatDate(proof.addedAt)}
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() => remove(proof.id)}
                  aria-label={`Remove ${proof.name}`}
                  className="shrink-0 rounded-lg p-2 text-white/25 transition-colors duration-200 hover:bg-signal-risk/10 hover:text-signal-risk"
                >
                  <Trash2 size={14} strokeWidth={1.7} aria-hidden />
                </button>
              </motion.li>
            );
          })}
        </AnimatePresence>

        {!proofs.length && (
          <li className="rounded-xl border border-dashed border-white/[0.08] px-4 py-6 text-center text-[13px] text-white/30">
            Nothing attached yet. A stage advance needs at least one piece of proof.
          </li>
        )}
      </ul>
    </div>
  );
}
