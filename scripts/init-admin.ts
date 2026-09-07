/**
 * Root Admin Bootstrap CLI
 *
 * Initializes the first AI_TECH_TEAM (admin) account when the users table is
 * empty. Safe to run repeatedly (e.g. on every container start) — it is a
 * no-op once any user exists.
 *
 * Usage:
 *   npx tsx scripts/init-admin.ts
 *
 * Env vars:
 *   ROOT_ADMIN_NAME     (default: "AI Tech Team Admin")
 *   ROOT_ADMIN_EMAIL    (default: "admin@rustomjee.com")
 *   ROOT_ADMIN_PASSWORD (default: "ChangeMe!12345")
 */
import "dotenv/config";

import { PrismaClient, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import readline from "node:readline/promises";

const prisma = new PrismaClient();

function isInteractive() {
  return Boolean(process.stdin.isTTY && process.stdout.isTTY);
}

async function promptForMissingCredentials(email: string, password: string) {
  if (!isInteractive()) {
    return { email, password };
  }

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  try {
    const answeredEmail =
      (await rl.question(`Root admin email [${email}]: `)).trim() || email;
    const answeredPassword =
      (await rl.question(`Root admin password [${password}]: `)).trim() ||
      password;
    return { email: answeredEmail, password: answeredPassword };
  } finally {
    rl.close();
  }
}

async function main() {
  const userCount = await prisma.user.count();

  if (userCount > 0) {
    console.log(
      `[init-admin] ${userCount} user(s) already exist. Database is not empty — skipping bootstrap.`
    );
    return;
  }

  const name = process.env.ROOT_ADMIN_NAME ?? "AI Tech Team Admin";
  let email = process.env.ROOT_ADMIN_EMAIL ?? "admin@rustomjee.com";
  let password = process.env.ROOT_ADMIN_PASSWORD ?? "ChangeMe!12345";

  if (!process.env.ROOT_ADMIN_EMAIL || !process.env.ROOT_ADMIN_PASSWORD) {
    const answers = await promptForMissingCredentials(email, password);
    email = answers.email;
    password = answers.password;
  }

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

  console.log("[init-admin] Root admin account created:");
  console.log(`  Name:  ${admin.name}`);
  console.log(`  Email: ${admin.email}`);
  console.log(`  Role:  ${admin.role}`);
  console.log(
    "[init-admin] Sign in and change the password immediately if it was left at the default value."
  );
}

main()
  .catch((error) => {
    console.error("[init-admin] Failed to bootstrap root admin:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
