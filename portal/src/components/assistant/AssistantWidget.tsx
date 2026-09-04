'use client';

import { useEffect, useRef, useState } from 'react';
import { Bot, MessageSquare, Send, Sparkles, X } from 'lucide-react';
import { Markdown } from './Markdown';
import { cn } from '@/lib/utils';

type Message = {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: string | null;
  notice?: string | null;
};

const SUGGESTIONS = [
  'What can I share with an external model?',
  'What counts as valid evidence?',
  'How do the five stages work?',
];

const GREETING: Message = {
  id: 'greeting',
  role: 'assistant',
  text:
    "I'm the AI.Next assistant. Ask me about **governance and data classification**, the **five-stage pipeline**, what counts as **evidence**, or how roles and permissions work.",
};

let counter = 0;
const nextId = () => `m${(counter += 1)}`;

/**
 * Persistent support widget, bottom-right on every authenticated screen.
 *
 * The model is never called from the browser: this posts to /api/assistant,
 * which holds the key and grounds the answer on programme policy.
 */
export function AssistantWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([GREETING]);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);

  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) logRef.current?.scrollTo({ top: logRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking, open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => inputRef.current?.focus(), 180);
    return () => clearTimeout(timer);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const send = async (raw?: string) => {
    const question = (raw ?? input).trim();
    if (!question || thinking) return;

    const history = messages
      .filter((m) => m.id !== 'greeting')
      .slice(-6)
      .map((m) => ({ role: m.role, text: m.text }));

    setMessages((prev) => [...prev, { id: nextId(), role: 'user', text: question }]);
    setInput('');
    setThinking(true);

    try {
      const res = await fetch('/api/assistant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, history }),
      });
      const data = (await res.json()) as {
        answer?: string;
        source?: string | null;
        notice?: string | null;
        error?: string;
      };

      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          text: data.answer ?? data.error ?? 'I could not answer that just now.',
          source: data.source ?? null,
          notice: data.notice ?? null,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: nextId(),
          role: 'assistant',
          text: 'I could not reach the assistant service. The **Resources Hub** has the Governance Policy and Playbook in full.',
        },
      ]);
    } finally {
      setThinking(false);
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="assistant-panel"
        aria-label={open ? 'Close AI assistant' : 'Open AI assistant'}
        className="fixed bottom-6 right-6 z-50 grid h-14 w-14 place-items-center rounded-2xl bg-accent-gradient text-ground shadow-accent transition-transform duration-300 ease-smooth hover:scale-105 active:scale-95"
      >
        <span aria-hidden className="absolute inset-0 animate-pulse-ring rounded-2xl border border-accent/50" />
        <span className="relative">
          {open ? <X size={21} strokeWidth={2} /> : <MessageSquare size={20} strokeWidth={2} />}
        </span>
      </button>

      {open && (
        <section
          id="assistant-panel"
          role="dialog"
          aria-label="AI.Next assistant"
          className="card fixed bottom-24 right-4 z-50 flex h-[min(580px,calc(100vh-8rem))] w-[calc(100vw-2rem)] max-w-[400px] animate-fade-up flex-col overflow-hidden md:right-6"
        >
          <header className="flex shrink-0 items-center gap-3 border-b border-line/70 px-5 py-4">
            <span className="grid h-9 w-9 place-items-center rounded-xl border border-accent/35 bg-accent/10 text-accent">
              <Bot size={17} strokeWidth={1.7} aria-hidden />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-[13.5px] text-ink">AI.Next Assistant</span>
              <span className="block font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                FAQs · platform · governance
              </span>
            </span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Close assistant"
              className="rounded-lg p-2 text-ink-faint transition-colors hover:bg-white/[0.05] hover:text-ink"
            >
              <X size={16} strokeWidth={1.9} aria-hidden />
            </button>
          </header>

          <div ref={logRef} aria-live="polite" className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {messages.map((message) => (
              <div
                key={message.id}
                className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
              >
                <div
                  className={cn(
                    'max-w-[88%] rounded-2xl px-4 py-3 text-[13.5px]',
                    message.role === 'user'
                      ? 'rounded-br-md bg-accent-gradient text-ground'
                      : 'rounded-bl-md border border-line/70 bg-ground/60 text-ink-muted',
                  )}
                >
                  {message.role === 'user' ? (
                    <p className="leading-relaxed">{message.text}</p>
                  ) : (
                    <>
                      {message.notice && (
                        <p className="mb-2.5 rounded-lg border border-warn/30 bg-warn/[0.07] px-2.5 py-2 text-[11.5px] leading-relaxed text-warn">
                          {message.notice}
                        </p>
                      )}
                      <Markdown content={message.text} />
                      {message.source && (
                        <p className="mt-3 flex items-start gap-1.5 border-t border-line/70 pt-2.5 font-mono text-[9.5px] uppercase tracking-[0.12em] text-accent/80">
                          <Sparkles size={10} strokeWidth={2} className="mt-px shrink-0" aria-hidden />
                          {message.source}
                        </p>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}

            {thinking && (
              <div className="flex justify-start">
                <div className="flex gap-1 rounded-2xl rounded-bl-md border border-line/70 bg-ground/60 px-4 py-3.5">
                  {[0, 1, 2].map((i) => (
                    <span
                      key={i}
                      className="h-1.5 w-1.5 animate-blink rounded-full bg-accent"
                      style={{ animationDelay: `${i * 0.18}s` }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {messages.length < 3 && (
            <div className="shrink-0 border-t border-line/70 px-5 py-3">
              <p className="mb-2.5 font-mono text-[9.5px] uppercase tracking-[0.14em] text-ink-faint">
                Try asking
              </p>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTIONS.map((suggestion) => (
                  <button
                    key={suggestion}
                    type="button"
                    onClick={() => void send(suggestion)}
                    className="rounded-lg border border-line px-2.5 py-1.5 text-left text-[11.5px] text-ink-muted transition-colors duration-300 hover:border-accent/40 hover:text-accent"
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          <form
            onSubmit={(e) => {
              e.preventDefault();
              void send();
            }}
            className="flex shrink-0 items-center gap-2 border-t border-line/70 p-3"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about policy, stages, evidence…"
              aria-label="Ask the AI.Next assistant"
              className="field py-2.5 text-[13px]"
            />
            <button
              type="submit"
              disabled={!input.trim() || thinking}
              aria-label="Send question"
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent-gradient text-ground transition-opacity duration-300 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <Send size={15} strokeWidth={2} aria-hidden />
            </button>
          </form>
        </section>
      )}
    </>
  );
}
