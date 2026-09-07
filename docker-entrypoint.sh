#!/bin/sh
set -e

echo "[entrypoint] applying database migrations..."
npx prisma migrate deploy

echo "[entrypoint] ensuring root admin account exists..."
npx tsx scripts/init-admin.ts || echo "[entrypoint] init-admin skipped/failed (non-fatal, continuing startup)"

echo "[entrypoint] starting application..."
exec "$@"
