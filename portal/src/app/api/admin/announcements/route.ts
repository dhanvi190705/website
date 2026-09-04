import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorizeRole, failure } from '@/lib/api-auth';
import { announcementSchema } from '@/lib/validation';

/** Broadcast an intimation, circular or action item to every champion. */
export async function POST(request: Request) {
  const auth = await authorizeRole(Role.TECH_TEAM);
  if (!auth.ok) return auth.response;

  try {
    const parsed = announcementSchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? 'Check the form.' },
        { status: 400 },
      );
    }
    const { title, body, pinned, publish } = parsed.data;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        body,
        pinned,
        authorId: auth.user.id,
        publishedAt: publish ? new Date() : null,
      },
      include: { author: { select: { name: true } } },
    });

    return NextResponse.json(
      {
        ok: true,
        announcement: {
          id: announcement.id,
          title: announcement.title,
          body: announcement.body,
          pinned: announcement.pinned,
          publishedAt: announcement.publishedAt?.toISOString() ?? null,
          authorName: announcement.author.name,
          createdAt: announcement.createdAt.toISOString(),
        },
      },
      { status: 201 },
    );
  } catch (error) {
    return failure(error, 'Could not publish the announcement.');
  }
}
