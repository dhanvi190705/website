import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { SetupForm } from './SetupForm';

export const dynamic = 'force-dynamic';

export default async function SetupPage() {
  // The setup route exists only while the portal has no users at all.
  if ((await prisma.user.count()) > 0) redirect('/login');
  return <SetupForm />;
}
