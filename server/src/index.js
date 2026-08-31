import { createApp } from './app.js';
import { env, usePrisma } from './lib/env.js';
import { disconnectPrisma } from './lib/prisma.js';

const app = createApp();

const server = app.listen(env.port, () => {
  console.log(`AI NEXT API listening on http://localhost:${env.port}`);
  console.log(`  data source : ${usePrisma ? 'PostgreSQL via Prisma' : 'bundled seed dataset'}`);
  console.log(`  cors origins: ${env.corsOrigins.join(', ') || '(none)'}`);
});

/** Finish in-flight requests before the process exits. */
const shutdown = (signal) => async () => {
  console.log(`\n${signal} received — shutting down`);
  server.close(async () => {
    await disconnectPrisma();
    process.exit(0);
  });
  // Do not hang forever on a stuck connection.
  setTimeout(() => process.exit(1), 10_000).unref();
};

process.on('SIGTERM', shutdown('SIGTERM'));
process.on('SIGINT', shutdown('SIGINT'));
