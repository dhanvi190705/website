import { NextResponse } from "next/server";

import { getSession } from "@/lib/session";
import { saveUploadedFile, UploadError } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED_SCOPES = new Set(["evidence", "resources", "misc"]);

/**
 * Generic local-filesystem upload handler.
 *
 * Accepts multipart/form-data with:
 *   - file: the File to persist
 *   - scope: subdirectory under UPLOAD_DIR ("evidence" | "resources" | "misc")
 *
 * Returns { fileUrl, fileName, fileType, fileSize } which callers persist to
 * the relevant DB table (Evidence, Resource, ...). Files are written to
 * UPLOAD_DIR (default: public/uploads), which should be mounted as a Docker
 * volume in production so uploads survive container restarts/redeploys.
 */
export async function POST(req: Request) {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file");
  const scopeRaw = formData.get("scope");
  const scope = typeof scopeRaw === "string" && ALLOWED_SCOPES.has(scopeRaw) ? scopeRaw : "misc";

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }

  try {
    const saved = await saveUploadedFile(file, scope);
    return NextResponse.json(saved, { status: 201 });
  } catch (error) {
    if (error instanceof UploadError) {
      return NextResponse.json({ error: error.message }, { status: error.status });
    }
    console.error("[api/upload] failed:", error);
    return NextResponse.json({ error: "Upload failed." }, { status: 500 });
  }
}
