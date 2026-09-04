import { NextResponse } from 'next/server';
import { EvidenceKind, Role } from '@prisma/client';
import { prisma } from '@/lib/prisma';
import { authorize, failure } from '@/lib/api-auth';
import { MAX_UPLOAD_BYTES, mimeAllowed, storeUpload } from '@/lib/storage';

/**
 * Attach evidence to a project — either a link or an uploaded file.
 *
 * Both arrive as multipart form data so one endpoint serves the whole Evidence
 * Section rather than splitting it by transport.
 */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const auth = await authorize();
  if (!auth.ok) return auth.response;
  const { user } = auth;

  try {
    const project = await prisma.project.findUnique({ where: { id: params.id } });
    if (!project) return NextResponse.json({ error: 'Project not found.' }, { status: 404 });

    if (user.role !== Role.TECH_TEAM && project.championId !== user.id) {
      return NextResponse.json({ error: 'This project is not assigned to you.' }, { status: 403 });
    }

    const form = await request.formData();
    const label = String(form.get('label') ?? '').trim();
    const note = String(form.get('note') ?? '').trim() || null;

    if (label.length < 2) {
      return NextResponse.json({ error: 'Give the evidence a label.' }, { status: 400 });
    }

    const file = form.get('file');
    const url = String(form.get('url') ?? '').trim();

    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_UPLOAD_BYTES) {
        return NextResponse.json(
          { error: 'That file is over the 20 MB limit — attach it as a link instead.' },
          { status: 413 },
        );
      }
      if (!mimeAllowed(file.type)) {
        return NextResponse.json(
          { error: `Files of type "${file.type || 'unknown'}" are not accepted.` },
          { status: 415 },
        );
      }

      const { storedName, sizeBytes } = await storeUpload(file);
      const evidence = await prisma.evidence.create({
        data: {
          projectId: project.id,
          uploadedById: user.id,
          kind: EvidenceKind.FILE,
          stage: project.stage,
          label,
          note,
          storedName,
          originalName: file.name,
          mimeType: file.type,
          sizeBytes,
        },
      });
      return NextResponse.json({ ok: true, evidence });
    }

    if (!/^https?:\/\//i.test(url)) {
      return NextResponse.json(
        { error: 'Attach a file, or enter a full URL starting with http:// or https://' },
        { status: 400 },
      );
    }

    const evidence = await prisma.evidence.create({
      data: {
        projectId: project.id,
        uploadedById: user.id,
        kind: EvidenceKind.LINK,
        stage: project.stage,
        label,
        note,
        url,
      },
    });

    return NextResponse.json({ ok: true, evidence });
  } catch (error) {
    return failure(error, 'Could not attach the evidence.');
  }
}
