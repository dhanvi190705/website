import { Role } from '@prisma/client';
import { PageHeader } from '@/components/layout/PageHeader';
import { UserManager } from '@/components/admin/UserManager';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/session';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Users · AI.Next Portal' };

export default async function AdminUsersPage() {
  const admin = await requireRole(Role.TECH_TEAM);

  const [users, units] = await Promise.all([
    prisma.user.findMany({
      orderBy: [{ role: 'asc' }, { name: 'asc' }],
      include: { businessUnit: { select: { name: true } } },
    }),
    prisma.businessUnit.findMany({ orderBy: { name: 'asc' }, select: { id: true, name: true } }),
  ]);

  return (
    <>
      <PageHeader
        eyebrow="Administration"
        title="Users & business units"
        description="Provision accounts, set roles, and map champions to the business unit they work in. Stands in for Internal IAM until SSO is wired up."
      />

      <UserManager
        currentUserId={admin.id}
        initialUnits={units}
        initialUsers={users.map((user) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
          businessUnitName: user.businessUnit?.name ?? null,
          lastLoginAt: user.lastLoginAt?.toISOString() ?? null,
        }))}
      />
    </>
  );
}
