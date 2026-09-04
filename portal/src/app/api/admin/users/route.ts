import { NextResponse } from 'next/server';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeRole, failure } from '@/lib/api-auth';
import { hashPassword, passwordProblem } from '@/lib/password';
import { createUserSchema, updateUserSchema } from '@/lib/validation';

/** Create an account. This stands in for provisioning through Internal IAM. */
export async function POST(request: Request) {
  const auth = await authorizeRole(Role.TECH_TEAM);
  if (!auth.ok) return auth.response;

  try {
    const parsed = createUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check the form.' },
        { status: 400 },
      );
    }

    const { name, email, password, role, businessUnitId } = parsed.data;

    const problem = passwordProblem(password);
    if (problem) return NextResponse.json({ error: problem }, { status: 400 });

    // A champion without a business unit cannot be mapped to their projects.
    if (role === Role.CHAMPION && !businessUnitId) {
      return NextResponse.json(
        { error: 'Champions must be assigned to a business unit.' },
        { status: 400 },
      );
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        businessUnitId: businessUnitId || null,
        passwordHash: await hashPassword(password),
      },
      include: { businessUnit: { select: { name: true } } },
    });

    return NextResponse.json(
      {
        ok: true,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          active: user.active,
          businessUnitName: user.businessUnit?.name ?? null,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'An account with that email already exists.' }, { status: 409 });
    }
    return failure(error, 'Could not create the account.');
  }
}

/** Deactivate, re-activate, change role/unit, or reset a password. */
export async function PATCH(request: Request) {
  const auth = await authorizeRole(Role.TECH_TEAM);
  if (!auth.ok) return auth.response;

  try {
    const parsed = updateUserSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Check the request and try again.' }, { status: 400 });
    }
    const { id, active, role, businessUnitId, password } = parsed.data;

    // Locking yourself out would leave the portal with no way back in.
    if (id === auth.user.id && (active === false || role === Role.CHAMPION)) {
      return NextResponse.json(
        { error: 'You cannot deactivate or demote your own account.' },
        { status: 400 },
      );
    }

    if (password) {
      const problem = passwordProblem(password);
      if (problem) return NextResponse.json({ error: problem }, { status: 400 });
    }

    const user = await prisma.user.update({
      where: { id },
      data: {
        ...(active !== undefined ? { active } : {}),
        ...(role !== undefined ? { role } : {}),
        ...(businessUnitId !== undefined ? { businessUnitId: businessUnitId || null } : {}),
        ...(password ? { passwordHash: await hashPassword(password) } : {}),
      },
      include: { businessUnit: { select: { name: true } } },
    });

    return NextResponse.json({
      ok: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        active: user.active,
        businessUnitName: user.businessUnit?.name ?? null,
      },
    });
  } catch (error) {
    return failure(error, 'Could not update the account.');
  }
}
