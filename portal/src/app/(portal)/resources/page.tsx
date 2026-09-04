import { BookOpen, FileText, Newspaper, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { resourceItems } from '@/lib/content';

export const metadata = { title: 'Resources · AI.Next Portal' };

const ICONS = {
  newsletter: Newspaper,
  governance: ShieldCheck,
  playbook: BookOpen,
} as const;

export default function ResourcesPage() {
  return (
    <>
      <PageHeader
        eyebrow="Resources Hub"
        title="Newsletters, policy and the playbook"
        description="The reference material every participant works from. Content below is placeholder text until the approved documents are supplied."
        action={<Badge tone="warn">Placeholder content</Badge>}
      />

      <div className="space-y-5">
        {resourceItems.map((item) => {
          const Icon = ICONS[item.id as keyof typeof ICONS] ?? FileText;
          return (
            <Card key={item.id} className="p-7 md:p-8">
              <div className="flex flex-col gap-7 lg:flex-row">
                <div className="lg:w-72 lg:shrink-0">
                  <div className="flex items-start gap-4">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl border border-accent/30 bg-accent/[0.07] text-accent">
                      <Icon size={18} strokeWidth={1.55} aria-hidden />
                    </span>
                    <div className="min-w-0">
                      <p className="eyebrow">{item.kicker}</p>
                      <h2 className="mt-2 text-[17px] font-medium leading-snug text-ink">
                        {item.title}
                      </h2>
                    </div>
                  </div>

                  <p className="mt-4 text-[13px] leading-relaxed text-ink-muted">
                    {item.description}
                  </p>
                  <p className="mt-4 font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                    {item.meta}
                  </p>
                </div>

                <div className="min-w-0 flex-1 space-y-3.5 border-line/60 lg:border-l lg:pl-8">
                  {item.body.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 40)}
                      className="text-[13.5px] leading-relaxed text-ink-muted"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
            </Card>
          );
        })}
      </div>

      <Card className="mt-5 p-6">
        <p className="text-[13px] leading-relaxed text-ink-muted">
          <span className="text-ink">Replacing this content:</span> the three items above are
          defined in <code className="rounded bg-accent/10 px-1.5 py-0.5 font-mono text-[12px] text-accent">src/lib/content.ts</code>.
          Swap the placeholder text for the approved documents, or point each card at wherever the
          real files are hosted.
        </p>
      </Card>
    </>
  );
}
