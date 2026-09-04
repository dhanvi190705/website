import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { Role } from '@prisma/client';
import { prisma } from './prisma';

export const SESSION_COOKIE = 'ainext_session';

type SessionPayload = {
  uid: string;
  role: Role;
  exp: number; // epoch seconds
};

function secret(): string {
  const value = process.env.SESSION_SECRET;
  if (!value || value.length < 16) {
    throw new Error(
      'SESSION_SECRET is missing or too short. Set it in .env — see .env.example for how to generate one.',
    );
  }
  return value;
}

function ttlSeconds(): number {
  const hours = Number(process.env.SESSION_TTL_HOURS ?? 12);
  return (Number.isFinite(hours) && hours > 0 ? hours : 12) * 3600;
}

const b64url = (input: Buffer | string) => Buffer.from(input).toString('base64url');

function sign(body: string): string {
  return createHmac('sha256', secret()).update(body).digest('base64url');
}

/**
 * Session tokens are `<payload>.<hmac>`.
 *
 * This stands in for the Internal IAM integration: the cookie is signed and
 * short-lived, but there is no token exchange or directory lookup. Replacing it
 * means swapping the two functions below for the IAM client — nothing else in
 * the app reads the cookie directly.
 */
export function createSessionToken(uid: string, role: Role): string {
  const payload: SessionPayload = {
    uid,
    role,
    exp: Math.floor(Date.now() / 1000) + ttlSeconds(),
  };
  const body = b64url(JSON.stringify(payload));
  return `${body}.${sign(body)}`;
}

export function readSessionToken(token: string | undefined): SessionPayload | null {
  if (!token) return null;

  const [body, signature] = token.split('.');
  if (!body || !signature) return null;

  const expected = Buffer.from(sign(body));
  const provided = Buffer.from(signature);
  if (expected.length !== provided.length || !timingSafeEqual(expected, provided)) return null;

  try {
    const payload = JSON.parse(Buffer.from(body, 'base64url').toString()) as SessionPayload;
    if (!payload?.uid || typeof payload.exp !== 'number') return null;
    if (payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export type SessionUser = {
  id: string;
  email: string;
  name: string;
  role: Role;
  businessUnitId: string | null;
  businessUnitName: string | null;
};

/**
 * Resolve the signed-in user, or null.
 *
 * The database is checked on every request rather than trusting the cookie's
 * role claim, so deactivating a user or changing their role takes effect
 * immediately instead of at their next login.
 */
export async function getSessionUser(): Promise<SessionUser | null> {
  const payload = readSessionToken(cookies().get(SESSION_COOKIE)?.value);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.uid },
    include: { businessUnit: true },
  });
  if (!user || !user.active) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    businessUnitId: user.businessUnitId,
    businessUnitName: user.businessUnit?.name ?? null,
  };
}

/** For pages: redirect to login when signed out. */
export async function requireUser(): Promise<SessionUser> {
  const user = await getSessionUser();
  // `redirect` throws, so nothing after this runs — returning it keeps the
  // control flow explicit to the type checker as well as the reader.
  if (!user) return redirect('/login');
  return user;
}

/** For pages: redirect away when the role is wrong. */
export async function requireRole(role: Role): Promise<SessionUser> {
  const user = await requireUser();
  if (user.role !== role) return redirect('/');
  return user;
}

export const isTechTeam = (user: { role: Role } | null): boolean =>
  user?.role === Role.TECH_TEAM;
