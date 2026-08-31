import { AnimatePresence, motion } from 'framer-motion';
import { Menu, ShieldCheck, Sparkles, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import Badge, { LiveBadge } from '../ui/Badge';
import { cn } from '../../lib/utils';

/**
 * Sleek fixed header: metallic wordmark, the tab rail that drives the SPA, a
 * live programme status badge and the champion's avatar with their cohort mark.
 * The gold underline is a single shared layout element, so switching tabs slides
 * it rather than redrawing it.
 */
export default function Header({ tabs, activeTab, onTabChange, user, status }) {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Never leave a mobile drawer open behind a tab change.
  const select = (id) => {
    onTabChange(id);
    setMenuOpen(false);
  };

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-500 ease-premium',
        scrolled
          ? 'border-b border-white/[0.07] bg-ink/80 backdrop-blur-xl shadow-lift'
          : 'border-b border-transparent bg-gradient-to-b from-ink via-ink/70 to-transparent',
      )}
    >
      <div className="mx-auto flex h-[68px] max-w-[1400px] items-center justify-between gap-4 px-5 md:px-10">
        {/* Wordmark */}
        <button
          type="button"
          onClick={() => select(tabs[0].id)}
          className="group flex shrink-0 items-center gap-3"
          aria-label="AI NEXT — go to Pioneer Vision"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-lg border border-gold-500/35 bg-charcoal">
            <Sparkles size={15} strokeWidth={1.75} className="text-gold-400" aria-hidden />
            <span className="absolute inset-0 rounded-lg bg-gold-500/10 opacity-0 blur-md transition-opacity duration-500 group-hover:opacity-100" />
          </span>
          <span className="font-display text-[15px] uppercase tracking-[0.22em] text-white">
            AI <span className="gold-text">NEXT</span>
          </span>
        </button>

        {/* Desktop tab rail */}
        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-1 rounded-xl border border-white/[0.07] bg-charcoal/60 p-1 backdrop-blur-md">
            {tabs.map((tab) => {
              const active = tab.id === activeTab;
              return (
                <li key={tab.id}>
                  <button
                    type="button"
                    onClick={() => select(tab.id)}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'relative rounded-lg px-4 py-2 font-mono text-[11px] uppercase tracking-[0.14em]',
                      'transition-colors duration-300',
                      active ? 'text-ink' : 'text-white/45 hover:text-gold-300',
                    )}
                  >
                    {active && (
                      <motion.span
                        layoutId="tab-pill"
                        className="absolute inset-0 rounded-lg bg-gold-gradient shadow-gold"
                        transition={{ type: 'spring', stiffness: 420, damping: 34 }}
                      />
                    )}
                    <span className="relative flex items-center gap-2">
                      <tab.icon size={13} strokeWidth={1.9} aria-hidden />
                      {tab.label}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* Status + identity */}
        <div className="flex shrink-0 items-center gap-3">
          <LiveBadge tone="gold" className="hidden md:inline-flex">
            {status}
          </LiveBadge>

          <div className="flex items-center gap-2.5 rounded-xl border border-white/[0.07] bg-charcoal/70 py-1.5 pl-1.5 pr-3 backdrop-blur-md">
            <span className="relative grid h-8 w-8 place-items-center rounded-lg bg-gold-gradient font-display text-[12px] text-ink">
              {user.initials}
              <ShieldCheck
                size={12}
                strokeWidth={2.4}
                aria-hidden
                className="absolute -bottom-1 -right-1 rounded-full bg-ink p-[1px] text-gold-400"
              />
            </span>
            <span className="hidden leading-tight sm:block">
              <span className="block text-[12px] text-white">{user.name}</span>
              <span className="block font-mono text-[9.5px] uppercase tracking-[0.14em] text-gold-500">
                {user.badge}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 text-white/70 transition-colors hover:border-gold-500/40 hover:text-gold-300 lg:hidden"
            aria-expanded={menuOpen}
            aria-label={menuOpen ? 'Close navigation' : 'Open navigation'}
          >
            {menuOpen ? <X size={16} strokeWidth={1.8} /> : <Menu size={16} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <motion.nav
            aria-label="Sections"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-white/[0.07] bg-ink/95 backdrop-blur-xl lg:hidden"
          >
            <ul className="space-y-1 px-5 py-4">
              {tabs.map((tab) => {
                const active = tab.id === activeTab;
                return (
                  <li key={tab.id}>
                    <button
                      type="button"
                      onClick={() => select(tab.id)}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left font-mono text-[11px] uppercase tracking-[0.14em] transition-colors',
                        active ? 'bg-gold-500/12 text-gold-200' : 'text-white/55 hover:bg-white/[0.04]',
                      )}
                    >
                      <tab.icon size={14} strokeWidth={1.9} aria-hidden />
                      {tab.label}
                      {active && <Badge tone="gold" className="ml-auto">Viewing</Badge>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
