import { NextResponse } from 'next/server';
import { Role, Stage } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorize, failure } from '@/lib/api-auth';
import { progressSchema } from '@/lib/validation';

/**
 * Record a stage update.
 *
 * The update row and the project's denormalised stage move in one transaction,
 * so the trail can never disagree with the current stage.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  try {
    const parsed = progressSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check the form.' },
        { status: 400 },
      );
    }

    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });

    // A champion may only update the project assigned to them.
    if (user.role !== Role.TECH_TEAM && project.championId !== user.id) {
      return NextResponse.json({ error: 'This project is not assigned to you.' }, { status: 403 });
    }

    const toStage = parsed.data.stage as Stage;

    const update = await prisma.$transaction(async (tx) => {
      const created = await tx.projectUpdate.create({
        data: {
          projectId: project.id,
          authorId: user.id,
          fromStage: project.stage,
          toStage,
          note: parsed.data.note,
        },
      });
      await tx.project.update({ where: { id: project.id }, data: { stage: toStage } });
      return created;
    });

    return NextResponse.json({
      ok: true,
      update: {
        id: update.id,
        fromStage: update.fromStage,
        toStage: update.toStage,
        note: update.note,
        createdAt: update.createdAt,
        authorName: user.name,
      },
    });
  } catch (error) {
    return failure(error, 'Could not save the update.');
  }
}
