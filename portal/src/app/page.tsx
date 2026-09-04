import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';

export const dynamic = 'force-dynamic';

/**
 * The front door. Sends each visitor to the first screen that is theirs:
 * first-run setup when the portal is empty, the tracker for a champion, the
 * executive dashboard for the AI/Tech Team.
 */
export default async function RootPage() {
  const userCount = await prisma.user.count();
  if (userCount === 0) redirect('/setup');

  const user = await getSessionUser();
  if (!user) redirect('/login');

  redirect(user.role === Role.TECH_TEAM ? '/dashboard' : '/tracker');
}
