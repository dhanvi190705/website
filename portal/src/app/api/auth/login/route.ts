import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyPassword } from '@/lib/password';
import { createSessionToken, SESSION_COOKIE } from '@/lib/session';
import { loginSchema } from '@/lib/validation';
import { failure } from '@/lib/api-auth';

export async function POST(request: Request) {
  try {
    const parsed = loginSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Enter your email and password.' }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const user = await prisma.user.findUnique({ where: { email } });

    // One message for every failure mode — a wrong email and a wrong password
    // must be indistinguishable, or the form becomes an account enumerator.
    const invalid = NextResponse.json(
      { error: 'Those credentials were not recognised.' },
      { status: 401 },
    );

    if (!user || !user.active) {
      // Still spend the hashing time so a missing account is not measurably faster.
      await verifyPassword(password, 'scrypt$00$00');
      return invalid;
    }

    if (!(await verifyPassword(password, user.passwordHash))) return invalid;

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const response = NextResponse.json({
      ok: true,
      redirectTo: user.role === 'TECH_TEAM' ? '/dashboard' : '/tracker',
    });

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
    return failure(error, 'Could not sign you in.');
  }
}
