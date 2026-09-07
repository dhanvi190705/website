import { PublishingHub } from "@/components/publish/PublishingHub";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PublishPage() {
  const announcements = await prisma.announcement.findMany({
    orderBy: { createdAt: "desc" },
    include: { author: { select: { name: true } } },
  });

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">Publishing Hub</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Draft and publish platform-wide announcements for AI Champions.
        </p>
      </div>

      <PublishingHub announcements={announcements} />
    </div>
  );
}
