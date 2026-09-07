import { ResourceCategory } from "@prisma/client";
import { NextResponse } from "next/server";

import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/session";
import { saveUploadedFile, UploadError } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get("category");

  const resources = await prisma.resource.findMany({
    where:
      category && Object.values(ResourceCategory).includes(category as ResourceCategory)
        ? { category: category as ResourceCategory }
        : {},
    orderBy: { createdAt: "desc" },
    include: { uploadedBy: { select: { id: true, name: true } } },
  });

  return NextResponse.json(resources);
}

export async function POST(req: Request) {
  const session = await requireAdmin().catch(() => null);
  if (!session) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const title = formData.get("title");
  const description = formData.get("description");
  const categoryRaw = formData.get("category");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (typeof title !== "string" || !title.trim()) {
    return NextResponse.json({ error: "Title is required." }, { status: 400 });
  }

  const category =
    typeof categoryRaw === "string" &&
    Object.values(ResourceCategory).includes(categoryRaw as ResourceCategory)
      ? (categoryRaw as ResourceCategory)
      : ResourceCategory.OTHER;

  try {
    const saved = await saveUploadedFile(file, "resources");

    const resource = await prisma.resource.create({
      data: {
        ...saved,
        title: title.trim(),
        description: typeof description === "string" && description.trim() ? description.trim() : null,
        category,
        uploadedById: session.user.id,
      },
      include: { uploadedBy: { select: { id: true, name: true } } },
    });

    return NextResponse.json(resource, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/resources] failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
