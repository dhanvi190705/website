import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { hashPassword, passwordProblem } from '@/lib/password';
import { createSessionToken, SESSION_COOKIE } from '@/lib/session';
import { setupSchema } from '@/lib/validation';
import { failure } from '@/lib/api-auth';

/**
 * First-run bootstrap: creates the first AI/Tech Team administrator.
 *
 * Deliberately unauthenticated, and safe because it refuses once any user
 * exists — the window is only ever the moment between deployment and the first
 * account. Every later account is created from the admin screens.
 */
export async function POST(request: Request) {
  try {
    if ((await prisma.user.count()) > 0) {
      return NextResponse.json(
        { error: 'Setup has already been completed. Sign in instead.' },
        { status: 409 },
      );
    }

    const parsed = setupSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check the form and try again.' },
        { status: 400 },
      );
    }

    const { name, email, password } = parsed.data;
    const problem = passwordProblem(password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: Role.TECH_TEAM,
        passwordHash: await hashPassword(password),
      },
    });

    const response = NextResponse.json({ ok: true, redirectTo: '/dashboard' });
    response.cookies.set({
      name: SESSION_COOKIE,
      value: createSessionToken(user.id, user.role),
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: Number(process.env.SESSION_TTL_HOURS ?? 12) * 3600,
    });
    return response;
  } catch (error) {
    return failure(error, 'Could not complete setup.');
  }
}
