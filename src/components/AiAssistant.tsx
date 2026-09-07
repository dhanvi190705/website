"use client";

import { useChat } from "ai/react";
import { AlertTriangle, Bot, Loader2, MessageCircle, Send, Sparkles, X } from "lucide-react";
import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

export function AiAssistant() {
  const { status } = useSession();
  const [open, setOpen] = useState(false);
  const [configured, setConfigured] = useState<boolean | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, input, handleInputChange, handleSubmit, isLoading, error } = useChat({
    api: "/api/chat",
  });

  useEffect(() => {
    if (!open || configured !== null) return;
    fetch("/api/chat")
      .then((res) => res.json())
      .then((data) => setConfigured(Boolean(data?.configured)))
      .catch(() => setConfigured(false));
  }, [open, configured]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open && (
        <div className="mb-3 flex h-[520px] w-[360px] flex-col overflow-hidden rounded-2xl border border-surface-border bg-surface-200 shadow-gold animate-slide-up">
          <div className="flex items-center justify-between border-b border-surface-border bg-surface-100 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
                <Sparkles className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-100">AI.Next Assistant</p>
                <p className="text-[11px] text-neutral-500">Grounded on platform FAQs &amp; governance</p>
              </div>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="rounded-lg p-1.5 text-neutral-500 hover:bg-surface-border/40 hover:text-neutral-200"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {configured === false ? (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 px-6 text-center">
              <AlertTriangle className="h-8 w-8 text-amber-400" />
              <p className="text-sm font-medium text-neutral-200">Assistant not configured</p>
              <p className="text-xs text-neutral-500">
                Your AI Tech Team admin needs to set the <code className="rounded bg-surface-100 px-1 py-0.5 text-gold-400">ANTHROPIC_API_KEY</code>{" "}
                environment variable on this deployment to enable the AI Assistant.
              </p>
            </div>
          ) : (
            <>
              <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
                {messages.length === 0 && (
                  <div className="flex flex-col items-center gap-2 py-10 text-center">
                    <Bot className="h-8 w-8 text-neutral-700" />
                    <p className="text-xs text-neutral-600">
                      Ask about the pipeline stages, governance rules, playbooks, or how to use
                      the portal.
                    </p>
                  </div>
                )}
                {messages.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "max-w-[85%] rounded-xl px-3 py-2 text-sm",
                      m.role === "user"
                        ? "ml-auto bg-gold-500 text-surface-600"
                        : "bg-surface-100 text-neutral-200"
                    )}
                  >
                    {m.content}
                  </div>
                ))}
                {isLoading && (
                  <div className="flex items-center gap-2 text-xs text-neutral-500">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Thinking…
                  </div>
                )}
                {error && (
                  <div className="rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2 text-xs text-red-300">
                    The assistant is temporarily unavailable. Please try again shortly.
                  </div>
                )}
              </div>

              <form onSubmit={handleSubmit} className="flex items-center gap-2 border-t border-surface-border p-3">
                <input
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Ask the AI.Next Assistant…"
                  className="input-field flex-1 text-sm"
                  disabled={configured === null}
                />
                <button
                  type="submit"
                  disabled={configured === null || isLoading || !input.trim()}
                  className="btn-gold px-3"
                >
                  <Send className="h-4 w-4" />
                </button>
              </form>
            </>
          )}
        </div>
      )}

      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-gold-500 text-surface-600 shadow-gold transition hover:bg-gold-400"
        aria-label="Toggle AI Assistant"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>
    </div>
  );
}
