import { AnimatePresence, motion } from 'framer-motion';
import { Bot, MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import Markdown from '../../lib/markdown';
import api from '../../lib/api';
import { assistantSuggestions } from '../../data/mockData';
import { cn, uid } from '../../lib/utils';

const GREETING = {
  id: 'msg-greeting',
  role: 'assistant',
  text:
    "I'm the AI NEXT concierge. Ask me about **policy and data classification**, moving your project between **stages**, what counts as valid **proof**, the **newsletter** cadence, or your **Batch 01 privileges**.",
  sources: [],
};

function TypingDots() {
  return (
    <span className="flex items-center gap-1 px-1 py-1.5" aria-label="Assistant is typing">
      {[0, 1, 2].map((i) => (
        <motion.span
          key={i}
          className="h-1.5 w-1.5 rounded-full bg-gold-400"
          animate={{ opacity: [0.25, 1, 0.25], y: [0, -3, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.16, ease: 'easeInOut' }}
        />
      ))}
    </span>
  );
}

/**
 * Persistent floating support widget.
 *
 * Answers come from `api.ask`, which resolves against the local FAQ knowledge
 * base by default and against POST /api/assistant once an API is configured —
 * so the panel is genuinely useful with no key and no network.
 */
export default function AiSupportWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([GREETING]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const [unseen, setUnseen] = useState(false);

  const logRef = useRef(null);
  const inputRef = useRef(null);
  const panelRef = useRef(null);

  // Keep the newest message in view as the conversation grows.
  useEffect(() => {
    if (!open) return;
    logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking, open]);

  useEffect(() => {
    if (open) {
      setUnseen(false);
      // Let the open animation start before stealing focus.
      const t = setTimeout(() => inputRef.current?.focus(), 220);
      return () => clearTimeout(t);
    }
    return undefined;
  }, [open]);

  // Escape closes the panel from anywhere inside it.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async (raw) => {
    const question = String(raw ?? input).trim();
    if (!question || thinking) return;

    setMessages((prev) => [...prev, { id: uid('msg'), role: 'user', text: question }]);
    setInput('');
    setThinking(true);

    try {
      const result = await api.ask(question, messages.slice(-6));
      setMessages((prev) => [
        ...prev,
        { id: uid('msg'), role: 'assistant', text: result.answer, sources: result.sources || [] },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: uid('msg'),
          role: 'assistant',
          text: "I could not reach the knowledge service. The **Resource & Policy Vault** has the Playbook and Governance Policy in full.",
          sources: [],
        },
      ]);
    } finally {
      setThinking(false);
      if (!open) setUnseen(true);
    }
  };

  return (
    <>
      {/* Launcher */}
      <motion.button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="ai-support-panel"
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, type: 'spring', stiffness: 320, damping: 22 }}
        whileHover={{ scale: 1.06 }}
        whileTap={{ scale: 0.95 }}
        className="fixed bottom-6 right-6 z-[60] grid h-14 w-14 place-items-center rounded-2xl bg-gold-gradient shadow-gold-lg md:bottom-8 md:right-8"
      >
        {/* Idle halo — reads as "live", not as an alert. */}
        <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-2xl border border-gold-400/50" />
        <AnimatePresence mode="wait" initial={false}>
          <motion.span
            key={open ? 'close' : 'open'}
            initial={{ opacity: 0, rotate: -70, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 70, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="relative text-ink"
          >
            {open ? <X size={21} strokeWidth={2} /> : <MessageSquare size={20} strokeWidth={2} />}
          </motion.span>
        </AnimatePresence>

        {unseen && !open && (
          <span
            aria-hidden
            className="absolute -right-0.5 -top-0.5 h-3.5 w-3.5 rounded-full border-2 border-ink bg-signal-ok"
          />
        )}
      </motion.button>

      {/* Panel */}
      <AnimatePresence>
        {open && (
          <motion.section
            id="ai-support-panel"
            ref={panelRef}
            role="dialog"
            aria-label="AI NEXT concierge"
            initial={{ opacity: 0, y: 22, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.97 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="glass fixed bottom-24 right-4 z-[60] flex h-[min(600px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-[404px] flex-col overflow-hidden md:bottom-28 md:right-8"
          >
            {/* Head */}
            <header className="flex shrink-0 items-center gap-3 border-b border-white/[0.07] px-5 py-4">
              <span className="relative grid h-9 w-9 place-items-center rounded-xl border border-gold-500/35 bg-gold-500/10">
                <Bot size={17} strokeWidth={1.7} className="text-gold-400" aria-hidden />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-[13.5px] text-white">AI NEXT Concierge</span>
                <span className="flex items-center gap-1.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-signal-ok">
                  <span className="h-1.5 w-1.5 rounded-full bg-signal-ok" aria-hidden />
                  Online · policy &amp; programme
                </span>
              </span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close assistant"
                className="rounded-lg p-2 text-white/35 transition-colors hover:bg-white/[0.06] hover:text-white"
              >
                <X size={16} strokeWidth={1.9} aria-hidden />
              </button>
            </header>

            {/* Log */}
            <div
              ref={logRef}
              aria-live="polite"
              className="flex-1 space-y-4 overflow-y-auto px-5 py-5"
            >
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
                >
                  <div
                    className={cn(
                      'max-w-[88%] rounded-2xl px-4 py-3',
                      message.role === 'user'
                        ? 'rounded-br-md bg-gold-gradient text-ink'
                        : 'rounded-bl-md border border-white/[0.07] bg-ink-soft/70',
                    )}
                  >
                    {message.role === 'user' ? (
                      <p className="text-[13.5px] leading-relaxed">{message.text}</p>
                    ) : (
                      <>
                        <Markdown className="text-[13.5px] text-white/75">{message.text}</Markdown>
                        {message.sources?.length > 0 && (
                          <p className="mt-3 flex items-start gap-1.5 border-t border-white/[0.07] pt-2.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-gold-500/80">
                            <Sparkles size={10} strokeWidth={2} className="mt-px shrink-0" aria-hidden />
                            {message.sources.join(' · ')}
                          </p>
                        )}
                      </>
                    )}
                  </div>
                </motion.div>
              ))}

              {thinking && (
                <div className="flex justify-start">
                  <div className="rounded-2xl rounded-bl-md border border-white/[0.07] bg-ink-soft/70 px-4 py-2">
                    <TypingDots />
                  </div>
                </div>
              )}
            </div>

            {/* Suggestions — only while the conversation is still short. */}
            {messages.length < 3 && (
              <div className="shrink-0 border-t border-white/[0.07] px-5 py-3">
                <p className="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.16em] text-white/30">
                  Try asking
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {assistantSuggestions.slice(0, 3).map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => send(suggestion)}
                      className="rounded-lg border border-white/[0.09] px-2.5 py-1.5 text-left text-[11.5px] text-white/55 transition-colors duration-300 hover:border-gold-500/40 hover:text-gold-300"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Composer */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="flex shrink-0 items-center gap-2 border-t border-white/[0.07] p-3"
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about policy, stages, proof…"
                aria-label="Ask the AI NEXT concierge"
                className="field py-2.5 text-[13px]"
              />
              <button
                type="submit"
                disabled={!input.trim() || thinking}
                aria-label="Send question"
                className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gold-gradient text-ink transition-opacity duration-300 disabled:cursor-not-allowed disabled:opacity-35"
              >
                <Send size={15} strokeWidth={2} aria-hidden />
              </button>
            </form>
          </motion.section>
        )}
      </AnimatePresence>
    </>
  );
}
