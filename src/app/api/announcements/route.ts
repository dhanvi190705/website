import { Role } from "@prisma/client";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/session";

const createSchema = z.object({
  title: z.string().trim().min(2).max(200),
  content: z.string().trim().min(1).max(20000),
  isPublished: z.boolean().optional().default(true),
});

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const where = session.user.role === Role.AI_TECH_TEAM ? {} : { isPublished: true };

  const announcements = await prisma.announcement.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json(announcements);
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

  const announcement = await prisma.announcement.create({
    data: {
      ...parsed.data,
      publishedAt: parsed.data.isPublished ? new Date() : null,
      authorId: session.user.id,
    },
    include: { author: { select: { id: true, name: true } } },
  });

  return NextResponse.json(announcement, { status: 201 });
}
