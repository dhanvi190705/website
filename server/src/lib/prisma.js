import { PrismaClient } from '@prisma/client';
import { env, usePrisma } from './env.js';

/**
 * Lazily-created Prisma client.
 *
 * Kept lazy for two reasons: the API is usable with no database at all, and in
 * development nodemon reloads would otherwise open a new pool on every save.
 */
let client = null;

export function getPrisma() {
  if (!usePrisma) return null;
  if (!client) {
    client = new PrismaClient({
      log: env.nodeEnv === 'development' ? ['warn', 'error'] : ['error'],
    });
  }
  return client;
}

export async function disconnectPrisma() {
  if (client) {
    await client.$disconnect();
    client = null;
  }
}

export default getPrisma;
