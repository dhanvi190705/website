import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const DEFAULT_BUSINESS_UNITS = [
  { name: "Construction", description: "Construction and site execution." },
  { name: "Sales", description: "Sales and CRM operations." },
  { name: "Design", description: "Architecture, design and planning." },
  {
    name: "Facility Management",
    description: "Post-handover facility and property management.",
  },
];

async function ensureBusinessUnits() {
  for (const bu of DEFAULT_BUSINESS_UNITS) {
    await prisma.businessUnit.upsert({
      where: { name: bu.name },
      update: {},
      create: bu,
    });
  }
  console.log(`Seeded ${DEFAULT_BUSINESS_UNITS.length} business units.`);
}

async function ensureRootAdmin() {
  const existingAdmin = await prisma.user.findFirst({
    where: { role: Role.AI_TECH_TEAM },
  });

  if (existingAdmin) {
    console.log(
      `Root admin already exists (${existingAdmin.email}); skipping creation.`
    );
    return;
  }

  const name = process.env.ROOT_ADMIN_NAME ?? "AI Tech Team Admin";
  const email = process.env.ROOT_ADMIN_EMAIL ?? "admin@rustomjee.com";
  const password = process.env.ROOT_ADMIN_PASSWORD ?? "ChangeMe!12345";

  const passwordHash = await bcrypt.hash(password, 12);

  const admin = await prisma.user.create({
    data: {
      name,
      email: email.toLowerCase(),
      passwordHash,
      role: Role.AI_TECH_TEAM,
      isActive: true,
    },
  });

  console.log(`Created root admin account: ${admin.email}`);
  console.log(
    "IMPORTANT: sign in and change this password immediately if it was left at the default."
  );
}

async function main() {
  await ensureBusinessUnits();
  await ensureRootAdmin();
}

main()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
