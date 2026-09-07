import { ResourcesHub } from "@/components/resources/ResourcesHub";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const [session, resources] = await Promise.all([
    getSession(),
    prisma.resource.findMany({
      orderBy: { createdAt: "desc" },
      include: { uploadedBy: { select: { name: true } } },
    }),
  ]);

  const isAdmin = session?.user.role === "AI_TECH_TEAM";

  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">Resources Hub</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Playbooks, policy documents, and newsletters for AI Champions across Rustomjee.
        </p>
      </div>

      <ResourcesHub resources={resources} isAdmin={isAdmin} />
    </div>
  );
}
