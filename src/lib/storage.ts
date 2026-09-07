import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const UPLOAD_DIR = process.env.UPLOAD_DIR ?? "public/uploads";
const MAX_SIZE_MB = Number(process.env.UPLOAD_MAX_SIZE_MB ?? "25");
export const UPLOAD_MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024;

export const ALLOWED_MIME_TYPES = new Set([
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/png",
  "image/jpeg",
  "image/webp",
  "image/gif",
  "text/plain",
  "text/csv",
  "application/zip",
]);

export class UploadError extends Error {
  status: number;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

function sanitizeFileName(originalName: string) {
  const ext = path.extname(originalName);
  const base = path
    .basename(originalName, ext)
    .replace(/[^a-zA-Z0-9-_]/g, "-")
    .slice(0, 80);
  return { base: base || "file", ext };
}

/**
 * Persists an uploaded File to local disk under UPLOAD_DIR/<subdir>/ and
 * returns metadata to store in the database. Designed so UPLOAD_DIR can be
 * bind-mounted as a Docker volume for on-prem persistence.
 */
export async function saveUploadedFile(file: File, subdir: string) {
  if (file.size <= 0) {
    throw new UploadError("Uploaded file is empty.");
  }

  if (file.size > UPLOAD_MAX_SIZE_BYTES) {
    throw new UploadError(
      `File exceeds the ${MAX_SIZE_MB}MB upload limit.`,
      413
    );
  }

  if (file.type && !ALLOWED_MIME_TYPES.has(file.type)) {
    throw new UploadError(`File type "${file.type}" is not permitted.`, 415);
  }

  const targetDir = path.join(process.cwd(), UPLOAD_DIR, subdir);
  await mkdir(targetDir, { recursive: true });

  const { base, ext } = sanitizeFileName(file.name);
  const storedName = `${Date.now()}-${randomUUID()}-${base}${ext}`;
  const absolutePath = path.join(targetDir, storedName);

  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(absolutePath, buffer);

  const publicUrl = `/uploads/${subdir}/${storedName}`.replace(/\\/g, "/");

  return {
    fileName: file.name,
    fileUrl: publicUrl,
    fileType: file.type || "application/octet-stream",
    fileSize: file.size,
  };
}
