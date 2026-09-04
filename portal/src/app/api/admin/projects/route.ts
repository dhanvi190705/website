import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeRole, failure } from '@/lib/api-auth';
import { assignProjectSchema, createProjectSchema } from '@/lib/validation';

export async function POST(request: Request) {
  const auth = await authorizeRole(Role.TECH_TEAM);
  if (!auth.ok) return auth.response;

  try {
    const parsed = createProjectSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check the form.' },
        { status: 400 },
      );
    }
    const { name, summary, businessUnitId, championId } = parsed.data;

    const project = await prisma.project.create({
      data: {
        name,
        summary: summary || null,
        businessUnitId,
        championId: championId || null,
      },
      include: {
        businessUnit: { select: { name: true } },
        champion: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(
      {
        ok: true,
        project: {
          id: project.id,
          name: project.name,
          summary: project.summary,
          stage: project.stage,
          businessUnitName: project.businessUnit.name,
          championId: project.champion?.id ?? null,
          championName: project.champion?.name ?? null,
          updatedAt: project.updatedAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return failure(error, 'Could not create the project.');
  }
}

/** Assign or reassign the champion who owns day-to-day progress. */
export async function PATCH(request: Request) {
  const auth = await authorizeRole(Role.TECH_TEAM);
  if (!auth.ok) return auth.response;

  try {
    const parsed = assignProjectSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: 'Check the request and try again.' }, { status: 400 });
    }

    const project = await prisma.project.update({
      where: { id: parsed.data.id },
      data: { championId: parsed.data.championId || null },
      include: { champion: { select: { id: true, name: true } } },
    });

    return NextResponse.json({
      ok: true,
      championId: project.champion?.id ?? null,
      championName: project.champion?.name ?? null,
    });
  } catch (error) {
    return failure(error, 'Could not assign the project.');
  }
}
