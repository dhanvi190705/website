# ── deps ────────────────────────────────────────────────────────────────────
FROM node:20-alpine AS deps
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY package.json package-lock.json* ./
# `npm ci` needs a lockfile; fall back to `install` on a fresh checkout.
RUN if [ -f package-lock.json ]; then npm ci; else npm install; fi

# ── build ───────────────────────────────────────────────────────────────────
FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat openssl
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# Prisma Client must be generated before the Next build type-checks against it.
RUN npx prisma generate
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# ── runtime ─────────────────────────────────────────────────────────────────
FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache openssl
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV UPLOAD_DIR=/app/uploads

RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nextjs

# The standalone output carries only the server and the modules it actually uses.
COPY --from=builder /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma CLI + schema + engines, so the container can run migrations on boot.
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/.bin ./node_modules/.bin

RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads
VOLUME /app/uploads

USER nextjs
EXPOSE 3000

# Apply any pending migrations, then serve.
CMD ["sh", "-c", "node_modules/.bin/prisma migrate deploy && node server.js"]
