import { NextResponse } from 'next/server';
import { Prisma, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeRole, failure } from '@/lib/api-auth';
import { businessUnitSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const auth = await authorizeRole(Role.TECH_TEAM);
  if (!auth.ok) return auth.response;

  try {
    const parsed = businessUnitSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check the form.' },
        { status: 400 },
      );
    }

    const unit = await prisma.businessUnit.create({
      data: { name: parsed.data.name, code: parsed.data.code || null },
    });
    return NextResponse.json({ ok: true, businessUnit: unit }, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
      return NextResponse.json({ error: 'A business unit with that name already exists.' }, { status: 409 });
    }
    return failure(error, 'Could not create the business unit.');
  }
}
