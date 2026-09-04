import { CircleDot } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { PageHeader } from '@/components/layout/PageHeader';
import { aboutSections } from '@/lib/content';

export const metadata = { title: 'About · AI.Next Portal' };

export default function AboutPage() {
  return (
    <>
      <PageHeader
        eyebrow="About AI.Next"
        title="The initiative, and what it asks of you"
        description="Why AI.Next exists, how it started, and the expectations on the people running initiatives inside it."
      />

      <div className="space-y-5">
        {aboutSections.map((section, index) => (
          <Card key={section.id} className="p-7 md:p-9">
            <div className="flex flex-col gap-8 lg:flex-row">
              <div className="lg:w-56 lg:shrink-0">
                <p className="eyebrow">{section.kicker}</p>
                <p className="mt-3 font-mono text-[36px] leading-none text-line">
                  {String(index + 1).padStart(2, '0')}
                </p>
              </div>

              <div className="min-w-0 flex-1">
                <h2 className="text-balance text-xl font-medium tracking-tight text-ink">
                  {section.title}
                </h2>

                <div className="mt-4 space-y-3.5">
                  {section.body.map((paragraph) => (
                    <p key={paragraph.slice(0, 40)} className="text-[14px] leading-relaxed text-ink-muted">
                      {paragraph}
                    </p>
                  ))}
                </div>

                {section.points.length > 0 && (
                  <ul className="mt-6 space-y-3 border-t border-line/60 pt-6">
                    {section.points.map((point) => (
                      <li key={point.slice(0, 40)} className="flex gap-3">
                        <CircleDot
                          size={14}
                          strokeWidth={1.8}
                          aria-hidden
                          className="mt-0.5 shrink-0 text-accent"
                        />
                        <span className="text-[13.5px] leading-relaxed text-ink-muted">{point}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </>
  );
}
