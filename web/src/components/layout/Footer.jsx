import { Sparkles } from 'lucide-react';
import { isLive } from '../../lib/api';

export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-white/[0.06] px-5 py-10 md:px-10">
      <div className="mx-auto flex max-w-[1400px] flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2.5">
          <Sparkles size={13} strokeWidth={1.75} className="text-gold-500" aria-hidden />
          <span className="font-display text-[12px] uppercase tracking-[0.2em] text-white/70">
            AI <span className="gold-text">NEXT</span>
          </span>
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">
            Batch 01 · Champion Platform
          </span>
        </div>

        <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-white/25">
          {isLive ? 'Connected to API' : 'Running on seed data'} · MVP build
        </p>
      </div>
    </footer>
  );
}
