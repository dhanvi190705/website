#!/usr/bin/env node
/**
 * Create an AI/Tech Team administrator from the command line.
 *
 * The normal route is the /setup screen on first run. This exists for the case
 * where nobody can reach that screen — a locked-out deployment, or provisioning
 * from a deploy script.
 *
 *   node scripts/create-admin.mjs "Full Name" name@company.com 'password'
 */
import { randomBytes, scrypt as scryptCb } from 'node:crypto';
import { promisify } from 'node:util';
import { PrismaClient } from '@prisma/client';

const scrypt = promisify(scryptCb);
const prisma = new PrismaClient();

const [name, email, password] = process.argv.slice(2);

if (!name || !email || !password) {
  console.error('Usage: node scripts/create-admin.mjs "Full Name" name@company.com \'password\'');
  process.exit(1);
}

if (password.length < 10) {
  console.error('Password must be at least 10 characters.');
  process.exit(1);
}

const salt = randomBytes(16);
const derived = await scrypt(password, salt, 64);
const passwordHash = `scrypt$${salt.toString('hex')}$${derived.toString('hex')}`;

try {
  const user = await prisma.user.upsert({
    where: { email: email.toLowerCase() },
    update: { role: 'TECH_TEAM', active: true, passwordHash },
    create: { name, email: email.toLowerCase(), role: 'TECH_TEAM', passwordHash },
  });
  console.log(`Administrator ready: ${user.email}`);
} catch (error) {
  console.error(error);
  process.exitCode = 1;
} finally {
  await prisma.$disconnect();
}
