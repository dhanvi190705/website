import { ProjectStage, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/session";

const createSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(1).max(4000),
  businessUnitId: z.string().min(1),
  championId: z.string().optional().nullable(),
});

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const where =
    session.user.role === Role.AI_TECH_TEAM
      ? {}
      : { championId: session.user.id };

  const projects = await prisma.project.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    include: {
      businessUnit: true,
      champion: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      _count: { select: { evidence: true, stageHistory: true } },
    },
  });

  return NextResponse.json(projects);
}

export async function POST(req: Request) {
  const session = await requireAdmin().catch(() => null);
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { name, description, businessUnitId, championId } = parsed.data;

  const project = await prisma.project.create({
    data: {
      name,
      description,
      businessUnitId,
      championId: championId || null,
      createdById: session.user.id,
      stage: ProjectStage.IDEATION_AND_SOLUTION_DEFINITION,
      stageHistory: {
        create: {
          fromStage: null,
          toStage: ProjectStage.IDEATION_AND_SOLUTION_DEFINITION,
          notes: "Project created.",
          changedById: session.user.id,
        },
      },
    },
    include: {
      businessUnit: true,
      champion: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(project, { status: 201 });
}
