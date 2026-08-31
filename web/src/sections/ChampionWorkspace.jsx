import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  History,
  Loader2,
  RotateCcw,
  Send,
  TriangleAlert,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import ProofDropzone from '../components/workspace/ProofDropzone';
import ReflectionLog, { REFLECTION_FIELDS } from '../components/workspace/ReflectionLog';
import StageSelector from '../components/workspace/StageSelector';
import Badge from '../components/ui/Badge';
import GlassCard from '../components/ui/GlassCard';
import GoldButton from '../components/ui/GoldButton';
import Meter from '../components/ui/Meter';
import SectionHeading from '../components/ui/SectionHeading';
import Markdown from '../lib/markdown';
import api from '../lib/api';
import useLocalStorage from '../hooks/useLocalStorage';
import { STAGES, stageById, stageIndex } from '../data/mockData';
import { cn, formatDate, relativeDays, uid } from '../lib/utils';

const EMPTY_REFLECTION = { wins: '', blockers: '', learnings: '' };

/** Submit is gated on the two things a reviewer actually needs. */
function validate({ proofs, reflection, stageChanged }) {
  const issues = [];
  if (stageChanged && !proofs.length) {
    issues.push('Attach at least one piece of proof before advancing the stage.');
  }
  if (!reflection.wins.trim() && !reflection.blockers.trim()) {
    issues.push('Log at least a win or a blocker — the reflection is what the review reads.');
  }
  return issues;
}

function SubmissionFeedback({ state, submission, onReset }) {
  return (
    <AnimatePresence mode="wait">
      {state === 'success' && submission && (
        <motion.div
          key="success"
          initial={{ opacity: 0, y: 10, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="overflow-hidden"
        >
          <div className="mt-5 flex flex-col gap-4 rounded-xl border border-signal-ok/30 bg-signal-ok/[0.07] p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-3.5">
              <CheckCircle2 size={19} strokeWidth={1.7} className="mt-0.5 shrink-0 text-signal-ok" aria-hidden />
              <div>
                <p className="text-[14px] text-white">Status submitted for review</p>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/50">
                  Logged at {new Date(submission.receivedAt).toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}
                  {' · '}
                  <span className="font-mono text-[11px] uppercase tracking-[0.12em] text-signal-ok">
                    {submission.status.replace('_', ' ')}
                  </span>
                  {' · '}
                  Reviewer: {submission.reviewer}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="inline-flex shrink-0 items-center gap-2 self-start rounded-lg border border-white/10 px-3.5 py-2 font-mono text-[10px] uppercase tracking-[0.14em] text-white/55 transition-colors hover:border-gold-500/40 hover:text-gold-300 sm:self-auto"
            >
              <RotateCcw size={12} strokeWidth={1.9} aria-hidden />
              Log another
            </button>
          </div>
        </motion.div>
      )}

      {state === 'error' && (
        <motion.div
          key="error"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          className="overflow-hidden"
        >
          <p role="alert" className="mt-5 rounded-xl border border-signal-risk/30 bg-signal-risk/[0.07] p-4 text-[13px] text-signal-risk">
            Could not reach the review service. Your draft is saved locally — try again in a moment.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export default function ChampionWorkspace({ workspace, user }) {
  const project = workspace?.project;

  const [stage, setStage] = useState(project?.stage || 'ideation');
  const [proofs, setProofs] = useState(workspace?.proofs || []);
  // Drafts survive a reload — a half-written reflection is real work.
  const [reflection, setReflection, resetDraft] = useLocalStorage(
    `ai-next:reflection-draft:${user.id}`,
    EMPTY_REFLECTION,
  );
  const [history, setHistory] = useState(workspace?.reflections || []);
  const [state, setState] = useState('idle'); // idle | submitting | success | error
  const [submission, setSubmission] = useState(null);
  const [attempted, setAttempted] = useState(false);

  const stageChanged = project ? stage !== project.stage : false;
  const issues = useMemo(
    () => validate({ proofs, reflection, stageChanged }),
    [proofs, reflection, stageChanged],
  );
  const blocked = issues.length > 0;

  const submit = async () => {
    setAttempted(true);
    if (blocked || state === 'submitting') return;

    setState('submitting');
    try {
      const payload = {
        projectId: project?.id,
        stage,
        proofs: proofs.map(({ previewUrl, ...rest }) => rest), // Object URLs are local-only.
        reflection,
      };
      const result = await api.submitStatus(user.id, payload);

      setSubmission(result);
      setState('success');
      setHistory((prev) => [
        { id: uid('r'), createdAt: new Date().toISOString().slice(0, 10), stage, ...reflection },
        ...prev,
      ]);
      resetDraft();
      setAttempted(false);
    } catch {
      setState('error');
    }
  };

  if (!project) {
    return (
      <div className="py-24 text-center text-white/40">Loading your workspace…</div>
    );
  }

  const currentStage = stageById(stage);
  const originalStage = stageById(project.stage);

  return (
    <div className="pb-8 pt-10">
      <SectionHeading
        eyebrow={`${user.badge} · ${project.deptCode}`}
        title="Champion Workspace"
        highlight="Workspace"
        lede="Where your project's truth lives: what stage it is really at, the proof that backs the claim, and an honest note on what moved and what is stuck."
        aside={
          <div className="flex flex-wrap items-center gap-2">
            <Badge tone="neutral" icon={Clock}>
              Updated {relativeDays(project.updatedAt)}
            </Badge>
            <Badge tone={project.pendingReview ? 'warn' : 'ok'}>
              {project.pendingReview ? 'In review' : 'Cleared'}
            </Badge>
          </div>
        }
      />

      {/* Project header card */}
      <GlassCard className="mt-12 p-7 md:p-8">
        <div className="flex flex-col gap-7 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Active project</p>
            <h3 className="mt-3 text-balance text-[clamp(19px,2.4vw,26px)] leading-tight">
              {project.name}
            </h3>
            <p className="mt-3 text-[13px] text-white/45">
              Owner {project.owner} · {project.milestonesCleared} of 5 milestones cleared ·{' '}
              {project.proofCount + proofs.length} proof items on record
            </p>
          </div>

          <div className="w-full max-w-sm shrink-0">
            <Meter value={project.health} label="Project health" sublabel="composite score" />
          </div>
        </div>
      </GlassCard>

      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        {/* Left: stage + proof */}
        <div className="space-y-6">
          <GlassCard className="p-7">
            <StageSelector value={stage} onChange={setStage} disabled={state === 'submitting'} />

            <AnimatePresence>
              {stageChanged && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="mt-5 flex items-center gap-3 rounded-xl border border-gold-500/25 bg-gold-500/[0.06] px-4 py-3.5">
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-white/45">
                      {originalStage.short}
                    </span>
                    <ArrowRight size={14} strokeWidth={1.9} className="text-gold-400" aria-hidden />
                    <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gold-300">
                      {currentStage.short}
                    </span>
                    <span className="ml-auto text-[12px] text-white/45">
                      {stageIndex(stage) > stageIndex(project.stage) ? 'Advance' : 'Step back'} · needs proof
                    </span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </GlassCard>

          <GlassCard className="p-7">
            <ProofDropzone proofs={proofs} onChange={setProofs} disabled={state === 'submitting'} />
          </GlassCard>
        </div>

        {/* Right: reflection + submit */}
        <div className="space-y-6">
          <GlassCard className="p-7">
            <ReflectionLog
              value={reflection}
              onChange={setReflection}
              disabled={state === 'submitting'}
            />

            {/* Validation surfaces only after a submit attempt — no scolding while typing. */}
            <AnimatePresence>
              {attempted && blocked && (
                <motion.ul
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mt-5 space-y-2 overflow-hidden"
                >
                  {issues.map((issue) => (
                    <li key={issue} className="flex items-start gap-2.5 text-[12.5px] text-signal-warn">
                      <TriangleAlert size={13} strokeWidth={1.8} className="mt-0.5 shrink-0" aria-hidden />
                      {issue}
                    </li>
                  ))}
                </motion.ul>
              )}
            </AnimatePresence>

            <div className="mt-7 flex flex-col gap-4 border-t border-white/[0.07] pt-6 sm:flex-row sm:items-center sm:justify-between">
              <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-white/30">
                {stageChanged ? 'Stage change included' : 'Status update only'} ·{' '}
                {proofs.length} proof · {REFLECTION_FIELDS.filter((f) => reflection[f.id]?.trim()).length}/3 written
              </p>

              <GoldButton
                onClick={submit}
                disabled={state === 'submitting'}
                icon={state === 'submitting' ? Loader2 : Send}
                className={cn(state === 'submitting' && '[&_svg]:animate-spin')}
              >
                {state === 'submitting' ? 'Submitting' : 'Submit status'}
              </GoldButton>
            </div>

            <SubmissionFeedback
              state={state}
              submission={submission}
              onReset={() => {
                setState('idle');
                setSubmission(null);
              }}
            />
          </GlassCard>

          {/* History */}
          <GlassCard className="p-7">
            <div className="flex items-center justify-between">
              <p className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
                <History size={12} strokeWidth={1.9} aria-hidden />
                Previous reflections
              </p>
              <Badge tone="neutral">{history.length}</Badge>
            </div>

            <ol className="mt-5 space-y-4">
              {history.map((entry) => {
                const entryStage = stageById(entry.stage);
                return (
                  <li
                    key={entry.id}
                    className="relative rounded-xl border border-white/[0.06] bg-ink-soft/40 p-5"
                  >
                    <span
                      aria-hidden
                      className="absolute left-0 top-5 h-8 w-[2px] rounded-r-full"
                      style={{ backgroundColor: entryStage.accent }}
                    />
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/40">
                        {formatDate(entry.createdAt)}
                      </span>
                      <Badge tone="neutral">{entryStage.label}</Badge>
                    </div>

                    <div className="mt-4 space-y-3.5">
                      {REFLECTION_FIELDS.map((field) =>
                        entry[field.id] ? (
                          <div key={field.id}>
                            <p
                              className="mb-1.5 font-mono text-[9.5px] uppercase tracking-[0.16em]"
                              style={{ color: field.tone }}
                            >
                              {field.label}
                            </p>
                            <Markdown className="text-[13px]">{entry[field.id]}</Markdown>
                          </div>
                        ) : null,
                      )}
                    </div>
                  </li>
                );
              })}

              {!history.length && (
                <li className="rounded-xl border border-dashed border-white/[0.08] px-4 py-8 text-center text-[13px] text-white/30">
                  No reflections logged yet.
                </li>
              )}
            </ol>
          </GlassCard>
        </div>
      </div>

      {/* Pipeline legend — the stage vocabulary, always available. */}
      <GlassCard className="mt-6 p-7">
        <p className="font-mono text-[10px] uppercase tracking-[0.18em] text-white/40">
          The pipeline
        </p>
        <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {STAGES.map((s, i) => {
            const reached = i <= stageIndex(stage);
            return (
              <li
                key={s.id}
                className={cn(
                  'rounded-xl border p-4 transition-colors duration-400',
                  reached ? 'border-white/[0.1] bg-white/[0.03]' : 'border-white/[0.05] bg-transparent',
                )}
              >
                <div className="flex items-center gap-2.5">
                  <span
                    aria-hidden
                    className="h-2 w-2 rounded-full"
                    style={{ backgroundColor: reached ? s.accent : 'rgba(255,255,255,0.14)' }}
                  />
                  <span className={cn('font-mono text-[10px] uppercase tracking-[0.14em]', reached ? 'text-white/75' : 'text-white/25')}>
                    {String(i + 1).padStart(2, '0')} · {s.short}
                  </span>
                </div>
                <p className={cn('mt-2.5 text-[12px] leading-relaxed', reached ? 'text-white/45' : 'text-white/20')}>
                  {s.blurb}
                </p>
              </li>
            );
          })}
        </ol>
      </GlassCard>
    </div>
  );
}
