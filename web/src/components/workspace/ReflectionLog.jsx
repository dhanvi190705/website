import { AnimatePresence, motion } from 'framer-motion';
import { AlertTriangle, Eye, Lightbulb, Pencil, Trophy } from 'lucide-react';
import { useState } from 'react';
import Markdown from '../../lib/markdown';
import { cn } from '../../lib/utils';

export const REFLECTION_FIELDS = [
  {
    id: 'wins',
    label: 'Wins',
    icon: Trophy,
    tone: '#4ADE80',
    placeholder:
      'What moved this fortnight? Be concrete — hours saved, accuracy gained, a step that stopped being manual.',
  },
  {
    id: 'blockers',
    label: 'Blockers',
    icon: AlertTriangle,
    tone: '#FBBF24',
    placeholder:
      'What is stuck, and what would unstick it? Blockers logged here are what route an AI Specialist to you.',
  },
  {
    id: 'learnings',
    label: 'Learnings',
    icon: Lightbulb,
    tone: '#D4AF37',
    placeholder: 'What would you tell the next champion who tries this? Include what did not work.',
  },
];

const MIN_CHARS = 40; // Enough to be a reflection rather than a checkbox.

/**
 * Markdown-enabled reflection log.
 *
 * Three fields rather than one free-form box, because "wins, blockers and
 * learnings" is the structure the programme reviews against — and because a
 * blocker buried in a paragraph never gets a specialist assigned to it.
 */
export default function ReflectionLog({ value, onChange, disabled = false }) {
  const [preview, setPreview] = useState(false);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between gap-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          Reflection log · Markdown
        </p>

        <div className="flex items-center gap-1 rounded-lg border border-white/[0.07] bg-ink-soft/70 p-1">
          {[
            { id: 'write', label: 'Write', icon: Pencil, on: !preview },
            { id: 'preview', label: 'Preview', icon: Eye, on: preview },
          ].map((mode) => (
            <button
              key={mode.id}
              type="button"
              onClick={() => setPreview(mode.id === 'preview')}
              aria-pressed={mode.on}
              className={cn(
                'relative rounded-md px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition-colors duration-300',
                mode.on ? 'text-ink' : 'text-white/40 hover:text-gold-300',
              )}
            >
              {mode.on && (
                <motion.span
                  layoutId="reflection-mode"
                  className="absolute inset-0 rounded-md bg-gold-gradient"
                  transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">
                <mode.icon size={11} strokeWidth={2} aria-hidden />
                {mode.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {REFLECTION_FIELDS.map((field) => {
          const text = value[field.id] || '';
          const short = text.trim().length > 0 && text.trim().length < MIN_CHARS;

          return (
            <div key={field.id}>
              <div className="mb-2 flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  <field.icon size={13} strokeWidth={1.8} aria-hidden style={{ color: field.tone }} />
                  <label
                    htmlFor={`reflection-${field.id}`}
                    className="font-mono text-[10.5px] uppercase tracking-[0.16em] text-white/65"
                  >
                    {field.label}
                  </label>
                </span>
                <span
                  className={cn(
                    'font-mono text-[10px] tabular-nums',
                    short ? 'text-signal-warn' : 'text-white/25',
                  )}
                >
                  {text.trim().length} chars
                </span>
              </div>

              <AnimatePresence mode="wait" initial={false}>
                {preview ? (
                  <motion.div
                    key="preview"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="min-h-[108px] rounded-xl border border-white/[0.07] bg-ink-soft/60 px-4 py-3.5"
                  >
                    {text.trim() ? (
                      <Markdown>{text}</Markdown>
                    ) : (
                      <p className="text-[13px] italic text-white/25">Nothing written yet.</p>
                    )}
                  </motion.div>
                ) : (
                  <motion.textarea
                    key="write"
                    id={`reflection-${field.id}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    rows={4}
                    disabled={disabled}
                    value={text}
                    onChange={(e) => onChange({ ...value, [field.id]: e.target.value })}
                    placeholder={field.placeholder}
                    className="field min-h-[108px] resize-y leading-relaxed"
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-white/25">
        Supports **bold** · *italic* · `code` · - bullets · # headings
      </p>
    </div>
  );
}
