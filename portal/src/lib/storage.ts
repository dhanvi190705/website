import { randomBytes } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024; // 20 MB

const ALLOWED_MIME = new Set([
  'image/png',
  'image/jpeg',
  'image/gif',
  'image/webp',
  'application/pdf',
  'text/plain',
  'text/csv',
  'text/markdown',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
]);

export function uploadDir(): string {
  return path.resolve(process.env.UPLOAD_DIR || './uploads');
}

export function mimeAllowed(mime: string): boolean {
  return ALLOWED_MIME.has(mime);
}

/**
 * Write an uploaded file to the storage volume.
 *
 * The stored name is generated, never derived from user input — the original
 * name is kept in the database for display only. That is what stops a crafted
 * filename from escaping the upload directory.
 */
export async function storeUpload(
  file: File,
): Promise<{ storedName: string; sizeBytes: number }> {
  const dir = uploadDir();
  await mkdir(dir, { recursive: true });

  const extension = path.extname(file.name).slice(0, 12).replace(/[^A-Za-z0-9.]/g, '');
  const storedName = `${Date.now().toString(36)}-${randomBytes(8).toString('hex')}${extension}`;

  const bytes = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, storedName), bytes);

  return { storedName, sizeBytes: bytes.byteLength };
}

/** Resolve a stored file, refusing anything that escapes the upload directory. */
export function resolveStoredPath(storedName: string): string | null {
  const dir = uploadDir();
  const resolved = path.resolve(dir, storedName);
  return resolved.startsWith(dir + path.sep) ? resolved : null;
}
