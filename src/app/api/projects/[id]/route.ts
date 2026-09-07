import { ProjectStatus, Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/session";

const updateSchema = z.object({
  name: z.string().trim().min(2).max(200).optional(),
  description: z.string().trim().min(1).max(4000).optional(),
  businessUnitId: z.string().min(1).optional(),
  championId: z.string().nullable().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
});

async function getProjectOr404(id: string) {
  return prisma.project.findUnique({
    where: { id },
    include: {
      businessUnit: true,
      champion: { select: { id: true, name: true, email: true } },
      createdBy: { select: { id: true, name: true } },
      stageHistory: {
        orderBy: { createdAt: "desc" },
        include: { changedBy: { select: { id: true, name: true } } },
      },
      evidence: {
        orderBy: { createdAt: "desc" },
        include: { uploadedBy: { select: { id: true, name: true } } },
      },
    },
  });
}

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const project = await getProjectOr404(params.id);
  if (!project) {
    return NextResponse.json({ error: "Project not found." }, { status: 404 });
  }

  if (session.user.role !== Role.AI_TECH_TEAM && project.championId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  return NextResponse.json(project);
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = updateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const project = await prisma.project.update({
    where: { id: params.id },
    data: parsed.data,
    include: {
      businessUnit: true,
      champion: { select: { id: true, name: true, email: true } },
    },
  });

  return NextResponse.json(project);
}
