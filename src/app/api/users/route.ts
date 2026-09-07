import { Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";

const createSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email(),
  password: z.string().min(8).max(200),
  role: z.nativeEnum(Role),
  businessUnitId: z.string().optional().nullable(),
});

export async function GET() {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: { businessUnit: true },
  });

  return NextResponse.json(
    users.map(({ passwordHash: _passwordHash, ...user }) => user)
  );
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

  const { name, email, password, role, businessUnitId } = parsed.data;

  if (role === Role.AI_CHAMPION && !businessUnitId) {
    return NextResponse.json(
      { error: "AI Champions must be assigned a business unit." },
      { status: 400 }
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role,
        businessUnitId: role === Role.AI_CHAMPION ? businessUnitId : businessUnitId ?? null,
      },
      include: { businessUnit: true },
    });

    const { passwordHash: _passwordHash, ...safeUser } = user;
    return NextResponse.json(safeUser, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "A user with that email already exists." },
      { status: 409 }
    );
  }
}
