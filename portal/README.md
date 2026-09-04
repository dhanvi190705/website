# AI.Next Portal

A centralized management platform to track, support and scale AI initiatives —
role-separated for **AI Champions** and the **AI / Tech Team**, built to run
on-prem in Docker.

```
portal/
├── prisma/schema.prisma     the data model
├── scripts/create-admin.mjs CLI bootstrap (the /setup screen is the normal route)
├── src/app/                 Next.js App Router — pages and API routes
├── src/components/          UI, tracker, admin, assistant
├── src/lib/                 auth, session, stages, analytics, content, storage
├── Dockerfile               multi-stage build, standalone output
└── docker-compose.yml       app + Postgres + volumes
```

---

## Quick start (Docker — the intended deployment)

```bash
cd portal
cp .env.example .env
# Generate a real session secret and paste it into .env:
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"

docker compose up -d --build
```

Open **http://localhost:3000**. The portal starts completely empty, so the
first screen is `/setup` — create the AI / Tech Team administrator there. That
route disables itself the moment a user exists.

Migrations run automatically on container start (`prisma migrate deploy`).

> **First run only:** the repository ships without a `prisma/migrations` folder.
> Generate the initial migration once against a running database —
> `npx prisma migrate dev --name init` — and commit it. Until then, use
> `npx prisma db push` to create the schema directly.

## Quick start (local, no Docker)

Requires Node 20+ and a PostgreSQL you can reach.

```bash
cd portal
npm install
cp .env.example .env          # set DATABASE_URL and SESSION_SECRET
npx prisma migrate dev --name init
npm run dev                   # http://localhost:3000
```

---

## First-run sequence

The app has no seed data by design. The order matters:

1. **`/setup`** — create the first AI / Tech Team administrator.
2. **Users** — create business units first, then champion accounts mapped to them.
3. **Projects** — create initiatives and assign each to a champion.
4. Champions sign in and see only what is assigned to them.

Locked out with no administrator? `npm run create-admin "Name" you@company.com 'password'`.

---

## Role-based interface matrix

| Module | AI Champions | AI / Tech Team |
|---|---|---|
| **Authentication** | Individual credentials, mapped to a business unit | Elevated administrative permissions |
| **Project Tracker** | Select an assigned project, move it through the 5 stages, attach evidence | Same tracker across every project, for corrections |
| **Executive Dashboard** | — | Aggregate progress, stage distribution, bottlenecks |
| **Users & business units** | — | Create accounts, set roles, map to units, deactivate |
| **Projects** | — | Create initiatives, assign and reassign champions |
| **Announcements** | Read-only | Direct publishing to every champion |
| **About / Resources / Assistant** | Full access | Full access |

Enforcement is server-side in every case: `requireRole()` guards pages,
`authorizeRole()` guards route handlers, and a champion's queries are scoped to
`championId` rather than filtered in the browser.

## The 5-stage pipeline

1. Ideation & Solution Definition
2. Feasibility & Scoping
3. Development & Integration
4. Testing & Pilot Deployment
5. Full Adoption & Value Realization

Defined once in `src/lib/stages.ts` — order, labels, definitions and colour.
Everything stage-aware reads from there.

---

## Authentication

Mock credential-based auth standing in for **Internal IAM**:

- Passwords hashed with Node's own **scrypt** (memory-hard, no native build step
  in the Docker image).
- Sessions are an HMAC-SHA256-signed, short-lived cookie — `httpOnly`,
  `sameSite=lax`, `secure` in production.
- The session's role claim is **not** trusted: every request re-reads the user,
  so deactivating an account or changing a role takes effect immediately rather
  than at next login.
- Login failures are indistinguishable between a wrong email and a wrong
  password, including timing, so the form is not an account enumerator.

**Swapping in real SSO** means replacing `createSessionToken` / `getSessionUser`
in `src/lib/session.ts`. Nothing else reads the cookie.

---

## AI Assistant

`POST /api/assistant` runs server-side; the API key never reaches the browser.

Keyword retrieval over the governance passages in `src/lib/content.ts` picks the
passage the model is allowed to answer from — so the assistant cannot invent
policy. Behaviour by configuration:

| `ANTHROPIC_API_KEY` | Behaviour |
|---|---|
| Unset | Reports itself **not configured**, and still returns the matched policy text directly |
| Set | Claude answers, grounded on the retrieved passage, citing its source |
| Set but upstream fails | Falls back to general guidance rather than erroring |

Uses `claude-opus-5` with server-side refusal fallbacks. If your installed SDK
version does not yet type the `fallbacks` parameter, delete those two lines in
`src/app/api/assistant/route.ts` — it is a resilience feature, not a requirement.

---

## Design system

The palette is a **placeholder** — a neutral premium dark + gold system standing
in until the real Rustomjee brand assets are supplied.

Every colour is a CSS custom property in the `:root` block of
`src/app/globals.css`, and Tailwind maps its names onto those properties. No
component references a raw colour, so rebranding is one block of edits.

Chart colour follows the data's job: the five stages are **ordered**, so they use
a monotonic single-hue ramp (magnitude), not five unrelated hues (identity).
Adjacent steps are close by design, so every chart also carries direct labels, a
legend and gaps between marks — colour is never the only cue.

## Replaceable placeholder content

`src/lib/content.ts` holds all of it in one module:

- **About AI.Next** — Overview, Origin Story, Agenda & Expectations
- **Resources Hub** — Newsletter, Governance Policy, AI Playbook
- **Assistant knowledge base** — the passages answers are grounded on

---

## File uploads

Evidence files are written to the `UPLOAD_DIR` volume, never to `public/`. The
stored filename is generated rather than derived from user input, and every
download passes through `/api/evidence/[id]/file`, which applies the same
authorisation as the project itself. Limit is 20 MB with a MIME allowlist.

---

## Environment variables

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string |
| `SESSION_SECRET` | yes | Signs session cookies — **change before deploying** |
| `SESSION_TTL_HOURS` | no | Login lifetime (default 12) |
| `ANTHROPIC_API_KEY` | no | Enables full assistant answers |
| `UPLOAD_DIR` | no | Evidence storage path (default `./uploads`) |

---

## Verification status

Honest account of what was and was not exercised while building this:

- **All 57 TypeScript sources type-check clean** with zero errors once
  missing-dependency cascades are excluded, verified with a deliberate-error
  probe to confirm the check was live.
- **Analytics and stage logic were executed** against representative data —
  progress maths, stage distribution, and all four bottleneck signals
  (stage pile-up, stalled projects, missing evidence, unassigned) fire correctly.
- **Prisma relation integrity checked** — every relation has both sides.
- **`npm install` was never run**, and therefore neither was `next build`. The
  authoring environment's package registry was blocked by egress policy. Treat
  the first `npm install && npm run build` as the real integration test.
- `@anthropic-ai/sdk` is pinned to `latest` rather than a version range for the
  same reason — the current version could not be verified from here. Pin it
  after your first successful install (`npm ls @anthropic-ai/sdk`).

---

## Superseded

`web/` and `server/` in the repository root are an earlier Vite + Express MVP,
kept for reference. This Next.js portal replaces them.
