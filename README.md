# AI NEXT

Centralized management platform for tracking and scaling AI initiatives across
Rustomjee business units — a standardized 5-stage project pipeline, audit
history, evidence uploads, executive KPIs, and a Claude-powered assistant.

## Tech Stack

- **Framework:** Next.js 14 (TypeScript, App Router)
- **Database / ORM:** PostgreSQL + Prisma
- **Auth:** NextAuth.js (Credentials provider, JWT sessions)
- **Styling:** Tailwind CSS — dark mode with vivid yellow (`#FFD400`) accents
- **AI:** Vercel AI SDK (`ai`, `@ai-sdk/anthropic`) streaming Claude 3.5 Sonnet
- **File storage:** Local filesystem (`public/uploads`), Docker-volume friendly
- **Deployment:** Docker / Docker Compose (on-premise)

## Roles

- `AI_TECH_TEAM` — Admin. Manages users, business units, project allocation,
  the Executive Dashboard, and the Publishing Hub.
- `AI_CHAMPION` — Business-unit owner. Drives their assigned projects through
  the pipeline and uploads evidence.

## Project Pipeline

Every project moves through five standardized stages, and every transition is
recorded in `ProjectStageHistory` for a full audit trail:

1. `IDEATION_AND_SOLUTION_DEFINITION`
2. `FEASIBILITY_AND_SCOPING`
3. `DEVELOPMENT_AND_INTEGRATION`
4. `TESTING_AND_PILOT_DEPLOYMENT`
5. `FULL_ADOPTION_AND_VALUE_REALIZATION`

## Local Development

```bash
cp .env.example .env
# edit .env — at minimum set DATABASE_URL and NEXTAUTH_SECRET
# (openssl rand -base64 32 to generate a secret)

npm install

# start a local Postgres however you prefer, e.g.:
docker run -d --name ai-next-db -e POSTGRES_USER=ainext -e POSTGRES_PASSWORD=ainext \
  -e POSTGRES_DB=ai_next_portal -p 5432:5432 postgres:16-alpine

npx prisma migrate dev --name init
npm run seed          # seeds default business units + root admin
npm run dev
```

Visit `http://localhost:3000` and sign in with the root admin credentials from
`.env` (`ROOT_ADMIN_EMAIL` / `ROOT_ADMIN_PASSWORD`).

### Root admin bootstrap

`scripts/init-admin.ts` creates the first `AI_TECH_TEAM` account only when the
`users` table is empty — safe to run on every startup:

```bash
npm run init-admin
```

`prisma/seed.ts` does the same plus seeds the four default business units
(Construction, Sales, Design, Facility Management) and is wired up as the
standard `prisma db seed` entry point.

## AI Assistant

The floating assistant (bottom-right, on every authenticated page) streams
responses from Claude 3.5 Sonnet via `app/api/chat/route.ts`, grounded on a
system prompt covering platform FAQs, AI governance rules, and playbook
guidance. If `ANTHROPIC_API_KEY` is not set, the widget shows a clear
"not configured" state instead of failing silently.

## File Uploads

`app/api/upload/route.ts` is a generic local-storage handler; Evidence and
Resource uploads use the same `src/lib/storage.ts` helper under the hood.
Files are written to `UPLOAD_DIR` (default `public/uploads`), which is mounted
as a named Docker volume (`ai_next_uploads`) in `docker-compose.yml` so
uploads persist across redeploys.

## Docker / On-Premise Deployment

```bash
cp .env.example .env
# set NEXTAUTH_SECRET, ROOT_ADMIN_PASSWORD, and (optionally) ANTHROPIC_API_KEY

docker compose up -d --build
```

On container start, `docker-entrypoint.sh` runs `prisma migrate deploy` and
`scripts/init-admin.ts` before starting the app — so a fresh deployment
bootstraps its own schema and root admin automatically.

## Project Structure

```
prisma/schema.prisma        Data model (Users, BusinessUnits, Projects, ...)
prisma/seed.ts               Seed: default BUs + root admin
scripts/init-admin.ts        Idempotent root-admin bootstrap CLI
src/lib/auth.ts               NextAuth configuration
src/lib/storage.ts            Local filesystem upload handler
src/middleware.ts             Role-based route protection
src/app/api/                  Route handlers (auth, chat, upload, CRUD)
src/app/dashboard/            Executive Dashboard (AI_TECH_TEAM)
src/app/champion/             AI Champion Dashboard
src/app/admin/                Admin Panel (users, BUs, project allocation)
src/app/publish/              Publishing Hub (announcements)
src/app/resources/            Resources Hub
src/app/about/                About AI.Next
src/app/projects/[id]/        Project detail (stage history + evidence)
src/components/AiAssistant.tsx  Floating AI chat widget
```
