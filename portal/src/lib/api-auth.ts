import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { getSessionUser, type SessionUser } from './session';

/**
 * Route-handler guards.
 *
 * These return a Response instead of redirecting, so an unauthenticated fetch
 * gets a 401 it can act on rather than an HTML login page.
 */
export async function authorize(): Promise<
  { ok: true; user: SessionUser } | { ok: false; response: NextResponse }
> {
  const user = await getSessionUser();
  if (!user) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Not signed in' }, { status: 401 }),
    };
  }
  return { ok: true, user };
}

export async function authorizeRole(
  role: Role,
): Promise<{ ok: true; user: SessionUser } | { ok: false; response: NextResponse }> {
  const result = await authorize();
  if (!result.ok) return result;
  if (result.user.role !== role) {
    return {
      ok: false,
      response: NextResponse.json({ error: 'Not permitted for your role' }, { status: 403 }),
    };
  }
  return result;
}

/** Turn a thrown error into a JSON response without leaking internals in prod. */
export function failure(error: unknown, fallback = 'Something went wrong'): NextResponse {
  console.error('[api]', error);
  const message =
    process.env.NODE_ENV === 'production'
      ? fallback
      : error instanceof Error
        ? error.message
        : String(error);
  return NextResponse.json({ error: message }, { status: 500 });
}
