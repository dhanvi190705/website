import { AdminPanel } from "@/components/admin/AdminPanel";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const [businessUnits, users, projects] = await Promise.all([
    prisma.businessUnit.findMany({ orderBy: { name: "asc" } }),
    prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      include: { businessUnit: true },
    }),
    prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
      include: {
        businessUnit: true,
        champion: { select: { id: true, name: true, email: true } },
      },
    }),
  ]);

  const safeUsers = users.map(({ passwordHash: _passwordHash, ...u }) => u);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6">
      <div>
        <h1 className="text-2xl font-semibold text-neutral-50">Admin Panel</h1>
        <p className="mt-1 text-sm text-neutral-500">
          Manage users, business units, and project allocation.
        </p>
      </div>

      <AdminPanel businessUnits={businessUnits} users={safeUsers} projects={projects} />
    </div>
  );
}
