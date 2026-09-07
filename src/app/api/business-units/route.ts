import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { getSession, requireAdmin } from "@/lib/session";

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  description: z.string().trim().max(500).optional(),
});

export async function GET() {
  const session = await getSession();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  const businessUnits = await prisma.businessUnit.findMany({
    orderBy: { name: "asc" },
  });

  return NextResponse.json(businessUnits);
}

export async function POST(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const body = await req.json().catch(() => null);
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  try {
    const businessUnit = await prisma.businessUnit.create({
      data: parsed.data,
    });
    return NextResponse.json(businessUnit, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "A business unit with that name already exists." },
      { status: 409 }
    );
  }
}
