import { Role } from '@prisma/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { AnnouncementComposer } from '@/components/admin/AnnouncementComposer';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Publish · AI.Next Portal' };

export default async function AdminAnnouncementsPage() {
  await requireRole(Role.TECH_TEAM);

  const announcements = await prisma.announcement.findMany({
    orderBy: [{ pinned: 'desc' }, { createdAt: 'desc' }],
    include: { author: { select: { name: true } } },
    take: 50,
  });

  return (
    <>
      <PageHeader
        eyebrow="Publishing & Announcements"
        title="Broadcast to every champion"
        description="Official intimations, circulars and action items. Champions see these read-only, newest first, with pinned items at the top."
      />

      <AnnouncementComposer
        initial={announcements.map((announcement) => ({
          id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          pinned: announcement.pinned,
          publishedAt: announcement.publishedAt?.toISOString() ?? null,
          authorName: announcement.author.name,
          createdAt: announcement.createdAt.toISOString(),
        }))}
      />
    </>
  );
}
