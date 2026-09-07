import { Lightbulb, Network, Share2, Sparkles, TrendingUp, Users } from "lucide-react";

import { displayFont } from "@/lib/fonts";
import { cn } from "@/lib/utils";

const STATS = [
  { value: "35", label: "AI Champions" },
  { value: "11", label: "AI Specialists" },
  { value: "7", label: "Tech Specialists" },
  { value: "15", label: "Departments" },
];

const PILLARS = [
  {
    icon: Lightbulb,
    title: "Augmenting, Not Replacing",
    description:
      "We put AI to work on better strategy, sharper decisions, and faster calls — amplifying human judgment and experience, never standing in for it.",
  },
  {
    icon: TrendingUp,
    title: "Tech Meets Experience",
    description:
      "We pair technology with real, on-the-ground experience to ship faster, sharper work — driving functional efficiency, helping teams hit their targets, and compounding into long-term improvement.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-16 px-4 py-16 sm:px-6">
      {/* Hero */}
      <div className="animate-slide-up text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 animate-float items-center justify-center rounded-2xl border border-gold-600/40 bg-gold-500/10 shadow-gold">
          <Sparkles className="h-8 w-8 text-gold-500" />
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.3em] text-gold-500">
          Our Story
        </p>
        <h1
          className={cn(
            displayFont.className,
            "bg-gradient-to-r from-gold-300 via-gold-500 to-gold-300 bg-[length:200%_auto] bg-clip-text text-5xl font-bold leading-tight text-transparent [animation-duration:6s] animate-gradient-shift sm:text-6xl"
          )}
        >
          This is AI NEXT
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-neutral-300 sm:text-xl">
          We&apos;re on a mission to bring AI into everyday work at Rustomjee — across{" "}
          <span className="font-semibold text-gold-400">every</span> department, in one
          structured, connected effort, instead of a hundred separate ones.
        </p>
      </div>

      {/* Narrative */}
      <div
        className="animate-slide-up space-y-5 text-center text-base leading-relaxed text-neutral-400 sm:text-lg"
        style={{ animationDelay: "80ms" }}
      >
        <p>
          Not a mandate handed down from the top — a network, built team by team. We help
          people put AI to work on better strategy, sharper decisions, and faster calls,
          amplifying human judgment and experience rather than standing in for it.
        </p>
        <p>
          What started as a small, scrappy effort has grown into a company-wide movement —
          real people, in real departments, solving real problems with AI, and sharing what
          works so progress in one team lifts every team.
        </p>
      </div>

      {/* Stats */}
      <div className="grid animate-slide-up grid-cols-2 gap-4 sm:grid-cols-4" style={{ animationDelay: "160ms" }}>
        {STATS.map(({ value, label }, i) => (
          <div
            key={label}
            className="group card animate-slide-up p-6 text-center transition-all duration-300 hover:-translate-y-1 hover:border-gold-600/60 hover:shadow-gold"
            style={{ animationDelay: `${200 + i * 60}ms` }}
          >
            <p
              className={cn(
                displayFont.className,
                "text-4xl font-bold text-gold-500 transition-transform duration-300 group-hover:scale-110 sm:text-5xl"
              )}
            >
              {value}
            </p>
            <p className="mt-2 text-sm text-neutral-400">{label}</p>
          </div>
        ))}
      </div>
      <p className="-mt-10 text-center text-xs text-neutral-600">
        Each Champion and Specialist drives AI adoption within their own team — turning
        company-wide ambition into department-level momentum.
      </p>

      {/* Pillars */}
      <div className="grid gap-4 md:grid-cols-2">
        {PILLARS.map(({ icon: Icon, title, description }, i) => (
          <div
            key={title}
            className="animate-slide-up card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-600/60 hover:shadow-gold"
            style={{ animationDelay: `${240 + i * 80}ms` }}
          >
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className={cn(displayFont.className, "mb-2 text-lg font-semibold text-neutral-100")}>
              {title}
            </h3>
            <p className="text-sm leading-relaxed text-neutral-500">{description}</p>
          </div>
        ))}
      </div>

      {/* Agenda / Going forward */}
      <div className="grid gap-4 md:grid-cols-2">
        <div
          className="animate-slide-up card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-600/60 hover:shadow-gold"
          style={{ animationDelay: "320ms" }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Network className="h-4 w-4 text-gold-500" />
            <h3 className={cn(displayFont.className, "text-lg font-semibold text-neutral-100")}>
              Our Agenda
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-neutral-500">
            Find real problems in each department, build practical AI-driven solutions for
            them, and share what works across the company — so a win in one team becomes a
            win for every team.
          </p>
        </div>
        <div
          className="animate-slide-up card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-gold-600/60 hover:shadow-gold"
          style={{ animationDelay: "380ms" }}
        >
          <div className="mb-3 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-gold-500" />
            <h3 className={cn(displayFont.className, "text-lg font-semibold text-neutral-100")}>
              Going Forward
            </h3>
          </div>
          <p className="text-sm leading-relaxed text-neutral-500">
            We&apos;re scaling the network further, turning one-off tools into shared,
            reusable systems, and making AI a permanent part of how Rustomjee operates —
            not a project, a habit.
          </p>
        </div>
      </div>

      {/* CTA */}
      <div
        className="animate-slide-up card p-8 text-center transition-all duration-300 hover:border-gold-600/60"
        style={{ animationDelay: "440ms" }}
      >
        <div className="mx-auto mb-3 flex h-10 w-10 animate-float items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
          <Users className="h-5 w-5" />
        </div>
        <p className={cn(displayFont.className, "mb-1 text-lg font-semibold text-neutral-100")}>
          Want in?
        </p>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-neutral-400">
          Questions about the program, governance, or how to get your business unit
          involved? Reach out to your AI Tech Team admin, or ask the AI NEXT Assistant in
          the bottom-right corner of any page.
        </p>
      </div>
    </div>
  );
}
