import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { getSessionUser } from '@/lib/session';
import { LoginForm } from './LoginForm';

export const dynamic = 'force-dynamic';

export default async function LoginPage() {
  // An empty portal has nothing to sign in to yet.
  if ((await prisma.user.count()) === 0) redirect('/setup');

  const user = await getSessionUser();
  if (user) redirect(user.role === Role.TECH_TEAM ? '/dashboard' : '/tracker');

  return <LoginForm />;
}
