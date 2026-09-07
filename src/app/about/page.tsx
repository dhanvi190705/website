import { CheckCircle2, Compass, Rocket, Sparkles, Target, Users } from "lucide-react";

const ROADMAP = [
  {
    phase: "Phase 1 — Foundation",
    icon: Compass,
    items: [
      "Identify AI Champions and AI Specialists across every business unit.",
      "Run HOD AI Workshops to surface high-impact problem statements.",
      "Stand up the AI.Next Portal as the single source of truth for tracking.",
    ],
  },
  {
    phase: "Phase 2 — Momentum",
    icon: Rocket,
    items: [
      "Move identified ideas through Feasibility & Scoping with clear success metrics.",
      "Pair every Champion with the AI Tech Team for solution design support.",
      "Publish playbooks and governance guardrails via the Resources Hub.",
    ],
  },
  {
    phase: "Phase 3 — Scale",
    icon: Target,
    items: [
      "Graduate pilots into Full Adoption with documented value realization.",
      "Recognize high-performing Champions through Rewards & Recognition.",
      "Expand successful patterns horizontally across other business units.",
    ],
  },
];

const PILLARS = [
  {
    icon: Users,
    title: "AI Champions Network",
    description:
      "Every business unit nominates Champions who own AI initiatives end-to-end — from ideation to value realization — supported directly by the AI Tech Team.",
  },
  {
    icon: CheckCircle2,
    title: "Standardized Lifecycle",
    description:
      "All projects move through the same five-stage pipeline with a full audit trail, so leadership always has an accurate, real-time view of portfolio health.",
  },
  {
    icon: Sparkles,
    title: "Governed & Grounded",
    description:
      "Governance rules, playbooks, and policy documents keep every initiative aligned with data privacy, security, and measurable business value.",
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
          AI.Next is Rustomjee&apos;s enterprise-wide program for discovering, scaling, and
          governing artificial intelligence initiatives — turning scattered pilots into a
          coordinated portfolio with measurable business value across Construction, Sales,
          Design, Facility Management, and every other business unit.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
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

      <div>
        <h2 className="mb-5 text-center text-xl font-semibold text-neutral-50">Roadmap</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {ROADMAP.map(({ phase, icon: Icon, items }) => (
            <div key={phase} className="card p-5">
              <div className="mb-3 flex items-center gap-2">
                <Icon className="h-4 w-4 text-gold-500" />
                <h3 className="text-sm font-semibold text-neutral-100">{phase}</h3>
              </div>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item} className="flex gap-2 text-sm text-neutral-500">
                    <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full bg-gold-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="card p-6 text-center">
        <p className="text-sm text-neutral-400">
          Questions about the program, governance rules, or how to get your business unit
          involved? Reach out to your AI Tech Team admin, or ask the AI.Next Assistant in
          the bottom-right corner of any page.
        </p>
      </div>
    </div>
  );
}
