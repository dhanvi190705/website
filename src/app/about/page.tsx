import { Lightbulb, Network, Share2, Sparkles, TrendingUp, Users } from "lucide-react";

const STATS = [
  { value: "38", label: "AI Champions" },
  { value: "10", label: "AI Specialists" },
  { value: "14", label: "Departments" },
];

const PILLARS = [
  {
    icon: Lightbulb,
    title: "Augmenting, Not Replacing",
    description:
      "We enable the use of AI to build better strategies, better decisions, and faster decision-making — augmenting human intervention and experience, not replacing it.",
  },
  {
    icon: TrendingUp,
    title: "Tech Meets Experience",
    description:
      "We bring tech and experience together to enable speedier, more insightful deliveries — driving functional efficiency, helping teams hit targets faster, and building long-term improvement.",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-12 px-4 py-12 sm:px-6">
      <div className="text-center">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-gold-600/40 bg-gold-500/10 shadow-gold">
          <Sparkles className="h-7 w-7 text-gold-500" />
        </div>
        <h1 className="text-3xl font-semibold text-neutral-50">
          About AI<span className="text-gold-500">.Next</span>
        </h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-neutral-400">
          AI Next is an initiative to adopt AI in everyday work across all departments at
          Rustomjee in a structured manner — rather than working in silos.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {STATS.map(({ value, label }) => (
          <div key={label} className="card p-6 text-center">
            <p className="text-3xl font-semibold text-gold-500">{value}</p>
            <p className="mt-1 text-sm text-neutral-400">{label}</p>
          </div>
        ))}
      </div>
      <p className="-mt-6 text-center text-xs text-neutral-600">
        What started as a small effort has grown into a company-wide network of AI Champions
        and AI Specialists, each driving AI adoption within their own teams.
      </p>

      <div className="grid gap-4 md:grid-cols-2">
        {PILLARS.map(({ icon: Icon, title, description }) => (
          <div key={title} className="card p-5">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
              <Icon className="h-5 w-5" />
            </div>
            <h3 className="mb-1 text-sm font-semibold text-neutral-100">{title}</h3>
            <p className="text-sm text-neutral-500">{description}</p>
          </div>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Network className="h-4 w-4 text-gold-500" />
            <h3 className="text-sm font-semibold text-neutral-100">Our Agenda</h3>
          </div>
          <p className="text-sm text-neutral-500">
            Identify real problems in each department, build practical AI-driven solutions for
            them, and share what works across the company — so progress in one team lifts
            every team.
          </p>
        </div>
        <div className="card p-5">
          <div className="mb-3 flex items-center gap-2">
            <Share2 className="h-4 w-4 text-gold-500" />
            <h3 className="text-sm font-semibold text-neutral-100">Going Forward</h3>
          </div>
          <p className="text-sm text-neutral-500">
            We aim to scale this network further, turn individual tools into shared, reusable
            systems, and make AI a permanent part of how Rustomjee operates.
          </p>
        </div>
      </div>

      <div className="card p-6 text-center">
        <div className="mx-auto mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gold-500/10 text-gold-500">
          <Users className="h-4 w-4" />
        </div>
        <p className="text-sm text-neutral-400">
          Questions about the program, governance rules, or how to get your business unit
          involved? Reach out to your AI Tech Team admin, or ask the AI.Next Assistant in
          the bottom-right corner of any page.
        </p>
      </div>
    </div>
  );
}
