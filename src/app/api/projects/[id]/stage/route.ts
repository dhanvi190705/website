import { ProjectStage, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";

const stageSchema = z.object({
  toStage: z.nativeEnum(ProjectStage),
  notes: z.string().trim().max(2000).optional(),
});

export async function POST(req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const project = await prisma.project.findUnique({ where: { id: params.id } });
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  const isAdmin = session.user.role === Role.AI_TECH_TEAM;
  const isOwningChampion = project.championId === session.user.id;

  if (!isAdmin && !isOwningChampion) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = stageSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { toStage, notes } = parsed.data;

  if (toStage === project.stage) {
    return NextResponse.json(
      { error: "Project is already in that stage." },
      { status: 400 }
    );
  }

  const [updatedProject] = await prisma.$transaction([
    prisma.project.update({
      where: { id: project.id },
      data: { stage: toStage },
      include: {
        businessUnit: true,
        champion: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.projectStageHistory.create({
      data: {
        projectId: project.id,
        fromStage: project.stage,
        toStage,
        notes,
        changedById: session.user.id,
      },
    }),
  ]);

  return NextResponse.json(updatedProject);
}
