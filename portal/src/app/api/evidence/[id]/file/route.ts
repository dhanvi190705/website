import { readFile } from 'node:fs/promises';
import { NextResponse } from 'next/server';
import { Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorize, failure } from '@/lib/api-auth';
import { resolveStoredPath } from '@/lib/storage';

/**
 * Serve an uploaded evidence file.
 *
 * Uploads live outside /public precisely so they cannot be fetched by guessing
 * a URL — every download passes the same authorisation as the project itself.
 */
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  try {
    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
      include: { project: { select: { championId: true } } },
    });

    if (!evidence || !evidence.storedName) {
      return NextResponse.json({ error: 'File not found.' }, { status: 404 });
    }

    if (user.role !== Role.TECH_TEAM && evidence.project.championId !== user.id) {
      return NextResponse.json({ error: 'Not permitted.' }, { status: 403 });
    }

    const filePath = resolveStoredPath(evidence.storedName);
    if (!filePath) return NextResponse.json({ error: 'File not found.' }, { status: 404 });

    const data = await readFile(filePath);
    const filename = (evidence.originalName || 'evidence').replace(/["\\\r\n]/g, '');

    return new NextResponse(new Uint8Array(data), {
      headers: {
        'Content-Type': evidence.mimeType || 'application/octet-stream',
        'Content-Length': String(data.byteLength),
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'private, max-age=0, must-revalidate',
      },
    });
  } catch (error) {
    return failure(error, 'Could not read the file.');
  }
}
