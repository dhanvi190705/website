import { Role } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { saveUploadedFile, UploadError } from "@/lib/storage";

export const runtime = "nodejs";

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

  const formData = await req.formData();
  const file = formData.get("file");
  const description = formData.get("description");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    const saved = await saveUploadedFile(file, `evidence/${project.id}`);

    const evidence = await prisma.evidence.create({
      data: {
        ...saved,
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        projectId: project.id,
        uploadedById: session.user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(evidence, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/projects/:id/evidence] failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
