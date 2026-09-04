import { Megaphone, Pin } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { EmptyState } from '@/components/ui/EmptyState';
import { Markdown } from '@/components/assistant/Markdown';
import { PageHeader } from '@/components/layout/PageHeader';
import { prisma } from '@/lib/prisma';
import { requireUser } from '@/lib/session';
import { formatDateTime } from '@/lib/utils';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Announcements · AI.Next Portal' };

/**
 * Read-only view of official intimations and circulars. The AI/Tech Team
 * publishes from /admin/announcements; champions only ever read.
 */
export default async function AnnouncementsPage() {
  const user = await requireUser();
  const isTech = user.role === 'TECH_TEAM';

  const announcements = await prisma.announcement.findMany({
    where: { publishedAt: { not: null } },
    orderBy: [{ pinned: 'desc' }, { publishedAt: 'desc' }],
    include: { author: { select: { name: true } } },
    take: 50,
  });

  return (
    <>
      <PageHeader
        eyebrow="Publishing & Announcements"
        title="Intimations, circulars and action items"
        description="Official updates from the AI / Tech Team. Pinned items carry an action or a deadline."
        action={<Badge tone="neutral">{announcements.length} published</Badge>}
      />

      {announcements.length === 0 ? (
        <Card>
          <EmptyState
            icon={Megaphone}
            title="Nothing published yet"
            description={
              isTech
                ? 'Publish the first circular from the Publish screen and it will appear here for every champion.'
                : 'When the AI / Tech Team publishes a circular or action item, it will appear here.'
            }
          />
        </Card>
      ) : (
        <div className="space-y-4">
          {announcements.map((announcement) => (
            <Card
              key={announcement.id}
              glow={announcement.pinned}
              className="p-6 md:p-7"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="mb-2.5 flex flex-wrap items-center gap-2">
                    {announcement.pinned && (
                      <Badge tone="accent" icon={Pin}>
                        Pinned
                      </Badge>
                    )}
                    <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-ink-faint">
                      {formatDateTime(announcement.publishedAt)} · {announcement.author.name}
                    </span>
                  </div>
                  <h2 className="text-balance text-[17px] font-medium leading-snug text-ink">
                    {announcement.title}
                  </h2>
                </div>
              </div>

              <div className="mt-4 border-t border-line/60 pt-4">
                <Markdown content={announcement.body} className="text-[13.5px] text-ink-muted" />
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}
