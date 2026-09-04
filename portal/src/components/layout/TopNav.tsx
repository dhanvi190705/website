'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import {
  BarChart3,
  BookOpen,
  Info,
  LogOut,
  Megaphone,
  Menu,
  ShieldCheck,
  SquareKanban,
  Users,
  X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { initialsOf } from '@/lib/utils';

export type NavUser = {
  name: string;
  email: string;
  role: 'CHAMPION' | 'TECH_TEAM';
  businessUnitName: string | null;
};

const CHAMPION_LINKS = [
  { href: '/tracker', label: 'Project Tracker', icon: SquareKanban },
  { href: '/announcements', label: 'Announcements', icon: Megaphone },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/about', label: 'About', icon: Info },
];

const TECH_LINKS = [
  { href: '/dashboard', label: 'Dashboard', icon: BarChart3 },
  { href: '/admin/projects', label: 'Projects', icon: SquareKanban },
  { href: '/admin/users', label: 'Users', icon: Users },
  { href: '/admin/announcements', label: 'Publish', icon: Megaphone },
  { href: '/resources', label: 'Resources', icon: BookOpen },
  { href: '/about', label: 'About', icon: Info },
];

export function TopNav({ user }: { user: NavUser }) {
  const pathname = usePathname();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);

  const links = user.role === 'TECH_TEAM' ? TECH_LINKS : CHAMPION_LINKS;
  const isTech = user.role === 'TECH_TEAM';

  const signOut = async () => {
    setSigningOut(true);
    await fetch('/api/auth/logout', { method: 'POST' });
    router.replace('/login');
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ground/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1400px] items-center justify-between gap-4 px-5 lg:px-8">
        <Link href={isTech ? '/dashboard' : '/tracker'} className="flex shrink-0 items-center gap-2.5">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-accent/35 bg-surface">
            <span className="h-2 w-2 rounded-full bg-accent-gradient" />
          </span>
          <span className="text-[15px] font-medium tracking-tight text-ink">
            AI<span className="accent-text">.Next</span>
          </span>
        </Link>

        <nav aria-label="Sections" className="hidden lg:block">
          <ul className="flex items-center gap-1">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    aria-current={active ? 'page' : undefined}
                    className={cn(
                      'flex items-center gap-2 rounded-lg px-3.5 py-2 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors duration-300',
                      active
                        ? 'bg-accent/12 text-accent'
                        : 'text-ink-faint hover:bg-white/[0.04] hover:text-ink',
                    )}
                  >
                    <link.icon size={13} strokeWidth={1.9} aria-hidden />
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="flex shrink-0 items-center gap-3">
          <div className="hidden items-center gap-2.5 rounded-xl border border-line bg-surface/70 py-1.5 pl-1.5 pr-3 sm:flex">
            <span className="relative grid h-7 w-7 place-items-center rounded-lg bg-accent-gradient text-[11px] font-medium text-ground">
              {initialsOf(user.name)}
              {isTech && (
                <ShieldCheck
                  size={11}
                  strokeWidth={2.4}
                  aria-hidden
                  className="absolute -bottom-1 -right-1 rounded-full bg-ground p-px text-accent"
                />
              )}
            </span>
            <span className="leading-tight">
              <span className="block text-[12px] text-ink">{user.name}</span>
              <span className="block font-mono text-[9px] uppercase tracking-[0.13em] text-accent">
                {isTech ? 'AI / Tech Team' : (user.businessUnitName ?? 'Champion')}
              </span>
            </span>
          </div>

          <button
            type="button"
            onClick={signOut}
            disabled={signingOut}
            className="hidden rounded-lg border border-line p-2 text-ink-faint transition-colors hover:border-risk/40 hover:text-risk disabled:opacity-50 sm:block"
            aria-label="Sign out"
            title="Sign out"
          >
            <LogOut size={15} strokeWidth={1.8} aria-hidden />
          </button>

          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="rounded-lg border border-line p-2 text-ink-muted transition-colors hover:text-accent lg:hidden"
          >
            {open ? <X size={16} strokeWidth={1.8} /> : <Menu size={16} strokeWidth={1.8} />}
          </button>
        </div>
      </div>

      {open && (
        <nav aria-label="Sections" className="border-t border-line/70 bg-ground/95 lg:hidden">
          <ul className="space-y-1 px-5 py-4">
            {links.map((link) => {
              const active = pathname === link.href || pathname.startsWith(`${link.href}/`);
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      'flex items-center gap-3 rounded-lg px-3 py-3 font-mono text-[11px] uppercase tracking-[0.12em] transition-colors',
                      active ? 'bg-accent/12 text-accent' : 'text-ink-muted hover:bg-white/[0.04]',
                    )}
                  >
                    <link.icon size={14} strokeWidth={1.9} aria-hidden />
                    {link.label}
                  </Link>
                </li>
              );
            })}
            <li className="pt-2">
              <button
                type="button"
                onClick={signOut}
                className="flex w-full items-center gap-3 rounded-lg px-3 py-3 font-mono text-[11px] uppercase tracking-[0.12em] text-risk transition-colors hover:bg-risk/10"
              >
                <LogOut size={14} strokeWidth={1.9} aria-hidden />
                Sign out — {user.email}
              </button>
            </li>
          </ul>
        </nav>
      )}
    </header>
  );
}
