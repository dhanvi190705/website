"use client";

import { signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, LogOut, Megaphone, ShieldCheck, Sparkles, BookOpen, Info } from "lucide-react";

import { cn } from "@/lib/utils";

export function Navbar() {
  const { data: session, status } = useSession();
  const pathname = usePathname();

  if (status !== "authenticated" || pathname === "/login") {
    return null;
  }

  const role = session.user.role;
  const isAdmin = role === "AI_TECH_TEAM";

  const links = [
    isAdmin
      ? { href: "/dashboard", label: "Executive Dashboard", icon: LayoutDashboard }
      : { href: "/champion", label: "My Projects", icon: LayoutDashboard },
    isAdmin ? { href: "/admin", label: "Admin Panel", icon: ShieldCheck } : null,
    isAdmin ? { href: "/publish", label: "Publishing Hub", icon: Megaphone } : null,
    { href: "/resources", label: "Resources", icon: BookOpen },
    { href: "/about", label: "About AI.Next", icon: Info },
  ].filter(Boolean) as { href: string; label: string; icon: typeof LayoutDashboard }[];

  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface-500/90 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={isAdmin ? "/dashboard" : "/champion"} className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-gold-500" />
          <span className="text-sm font-semibold tracking-wide text-neutral-50">
            AI<span className="text-gold-500">.Next</span> Portal
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          {links.map(({ href, label, icon: Icon }) => (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition",
                pathname.startsWith(href)
                  ? "bg-gold-500/10 text-gold-400"
                  : "text-neutral-400 hover:bg-surface-100 hover:text-neutral-100"
              )}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium text-neutral-100">{session.user.name}</p>
            <p className="text-xs text-neutral-500">
              {isAdmin ? "AI Tech Team" : session.user.businessUnitName ?? "AI Champion"}
            </p>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="flex items-center gap-1.5 rounded-lg border border-surface-border px-3 py-1.5 text-sm text-neutral-400 transition hover:border-gold-600 hover:text-gold-400"
          >
            <LogOut className="h-4 w-4" />
            <span className="hidden sm:inline">Sign out</span>
          </button>
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-surface-border px-4 py-2 md:hidden">
        {links.map(({ href, label, icon: Icon }) => (
          <Link
            key={href}
            href={href}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium",
              pathname.startsWith(href)
                ? "bg-gold-500/10 text-gold-400"
                : "text-neutral-400"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
