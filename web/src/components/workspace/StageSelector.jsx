import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { STAGES, stageById, stageIndex } from '../../data/mockData';
import { cn } from '../../lib/utils';

/**
 * Stage dropdown for the champion's project.
 *
 * Built as a real listbox rather than a native <select> so the pipeline order,
 * each stage's definition and the direction of travel are all visible while
 * choosing. Keyboard: Enter/Space/Arrow to open, arrows to move, Enter to
 * commit, Escape to cancel.
 */
export default function StageSelector({ value, onChange, disabled = false }) {
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(() => stageIndex(value));
  const rootRef = useRef(null);
  const current = stageById(value);
  const currentIdx = stageIndex(value);

  useEffect(() => {
    if (open) setCursor(stageIndex(value));
  }, [open, value]);

  // Click-away closes without committing.
  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    return () => document.removeEventListener('mousedown', onDocClick);
  }, [open]);

  const commit = (index) => {
    onChange(STAGES[index].id);
    setOpen(false);
  };

  const onKeyDown = (e) => {
    if (!open) {
      if (['Enter', ' ', 'ArrowDown', 'ArrowUp'].includes(e.key)) {
        e.preventDefault();
        setOpen(true);
      }
      return;
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setCursor((c) => Math.min(STAGES.length - 1, c + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setCursor((c) => Math.max(0, c - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      commit(cursor);
    }
  };

  return (
    <div ref={rootRef} className="relative">
      <label
        id="stage-selector-label"
        className="mb-2.5 block font-mono text-[10px] uppercase tracking-[0.18em] text-white/40"
      >
        Current stage
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={onKeyDown}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-labelledby="stage-selector-label"
        className={cn(
          'group flex w-full items-center gap-4 rounded-xl border px-4 py-3.5 text-left',
          'transition-all duration-300 ease-premium disabled:cursor-not-allowed disabled:opacity-50',
          open
            ? 'border-gold-500/60 bg-charcoal shadow-gold'
            : 'border-white/10 bg-ink-soft/80 hover:border-gold-500/35',
        )}
      >
        <span
          aria-hidden
          className="h-8 w-1 shrink-0 rounded-full"
          style={{ backgroundColor: current.accent, boxShadow: `0 0 14px -2px ${current.accent}` }}
        />
        <span className="min-w-0 flex-1">
          <span className="block text-[15px] text-white">{current.label}</span>
          <span className="block truncate text-[12px] text-white/40">{current.blurb}</span>
        </span>
        <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
          {currentIdx + 1}/{STAGES.length}
        </span>
        <ChevronDown
          size={16}
          strokeWidth={1.8}
          aria-hidden
          className={cn('shrink-0 text-white/40 transition-transform duration-300', open && 'rotate-180 text-gold-400')}
        />
      </button>

      {/* Pipeline rail — where this project sits in the whole journey. */}
      <div className="mt-3 flex items-center gap-1.5" aria-hidden>
        {STAGES.map((stage, i) => (
          <span
            key={stage.id}
            className="h-1 flex-1 rounded-full transition-all duration-500"
            style={{ backgroundColor: i <= currentIdx ? stage.accent : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>

      <AnimatePresence>
        {open && (
          <motion.ul
            role="listbox"
            aria-labelledby="stage-selector-label"
            aria-activedescendant={`stage-option-${STAGES[cursor].id}`}
            tabIndex={-1}
            initial={{ opacity: 0, y: -6, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.985 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="absolute left-0 right-0 top-[calc(100%+18px)] z-30 overflow-hidden rounded-xl border border-white/10 bg-charcoal/95 p-1.5 shadow-lift backdrop-blur-2xl"
          >
            {STAGES.map((stage, i) => {
              const selected = stage.id === value;
              return (
                <li
                  key={stage.id}
                  id={`stage-option-${stage.id}`}
                  role="option"
                  aria-selected={selected}
                  onMouseEnter={() => setCursor(i)}
                  onClick={() => commit(i)}
                  className={cn(
                    'flex cursor-pointer items-center gap-3.5 rounded-lg px-3 py-2.5 transition-colors duration-200',
                    cursor === i ? 'bg-white/[0.06]' : 'bg-transparent',
                  )}
                >
                  <span
                    aria-hidden
                    className="h-6 w-1 shrink-0 rounded-full"
                    style={{ backgroundColor: stage.accent }}
                  />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] text-white">{stage.label}</span>
                    <span className="block truncate text-[11.5px] text-white/40">{stage.blurb}</span>
                  </span>
                  {selected && <Check size={14} strokeWidth={2.2} className="shrink-0 text-gold-400" aria-hidden />}
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
