# AI.Next

> **Start here: [`portal/`](portal/README.md)** — the AI.Next Portal (Next.js +
> Prisma + PostgreSQL, Dockerized for on-prem). That is the current application.
>
> `web/` and `server/` below are an earlier Vite + Express MVP, kept for
> reference and superseded by the portal.

---

## AI NEXT — Champion Platform (earlier MVP)

An exclusive workspace for AI Champions and Specialists: a tabbed single-page app
where champions track a project through the pipeline, attach proof of work, log
reflections, pull policy documents, and where leadership sees the whole programme
in one view.

```
website/
├── web/                  React (Vite) + Tailwind + Framer Motion + Lucide
├── server/               Express + Prisma (PostgreSQL) API
└── ai-next-md v3.html    the original static prototype (kept for reference)
```

---

## Quick start

The SPA runs **standalone on bundled seed data** — no backend, no database, no
API key. Everything below is interactive on a fresh clone.

```bash
cd web
npm install
npm run dev            # http://localhost:5173
```

To run the API alongside it:

```bash
cd server
npm install
cp .env.example .env   # leave DATABASE_URL blank to run on the seed dataset
npm run dev            # http://localhost:4000
```

Then point the SPA at it — either set `VITE_API_URL=http://localhost:4000` in
`web/.env`, or rely on the Vite dev proxy already configured for `/api`.

With PostgreSQL available:

```bash
cd server
# set DATABASE_URL in .env, then
npm run prisma:migrate  # create the schema
npm run seed            # load the Batch 01 roster (idempotent)
npm run dev
```

---

## Design system

| Token | Value | Role |
|---|---|---|
| Pitch black | `#0B0B0B` | page ground |
| Dark charcoal | `#161616` | cards, containers, glass fill |
| Metallic gold | `#D4AF37` | primary accent, borders, glow |
| Sparkling gold | `#FFD700` | gradient highlight, active state |
| Crisp white | `#FFFFFF` | text and contrast elements |

Everything is defined once in `web/tailwind.config.js` and
`web/src/index.css`. The depth comes from light rather than geometry: floating
glass panels (`.glass`), a hairline that warms to gold on hover, a specular top
edge, slow-drifting gold auras over a faint grid, and a sheen that sweeps across
a card on pointer-enter. No 3D primitives.

Type is Archivo (display), IBM Plex Sans (body) and IBM Plex Mono (labels and
figures) — carried over from the original prototype so the brand stays continuous.

Motion is Framer Motion throughout, on one easing curve
(`cubic-bezier(0.22, 1, 0.36, 1)`), and the whole system collapses under
`prefers-reduced-motion`.

### Chart colour

The five pipeline stages are an **ordered** set, so their colour is a monotonic
single-hue gold ramp (magnitude), not five arbitrary hues (identity):

```
Ideation #8A6F1F → PoC #BE9A22 → Validation #E2B93C → Production #F0D480 → Scaling #FBF0C6
```

Adjacent steps are close by design, so every chart that uses them also carries a
direct label, a legend and a 2px gap between marks — colour is never the only
cue. Health scores use a separate, reserved status palette and always print the
band name beside the value.

---

## What is implemented

**Header & navigation** — fixed glass header, metallic `AI NEXT` wordmark, a tab
rail whose gold pill slides between sections (shared `layoutId`), a live
programme status badge, and the champion's avatar carrying their
`First Batch Champion` mark. Collapses to a drawer under `lg`. The URL hash is
the router, so deep links and browser back both work.

**1 · Pioneer Vision** — hero for the inaugural cohort, vision statement, a live
programme scoreboard that counts up on entry, an interactive seven-stop milestone
path (select any stop to open its detail card) with a progress rail, and the six
Batch 01 privileges.

**2 · Champion Workspace** — a custom stage listbox (Ideation → PoC → Validation
→ Production → Scaling) showing each stage's definition and the direction of
travel; a proof dropzone taking dragged files, browsed files, pasted links and
git remotes, with image previews and 15 MB guard; a Markdown reflection log split
into Wins / Blockers / Learnings with a live preview toggle; and a submit action
that validates (a stage advance needs proof; a reflection needs substance),
shows submitting → success feedback, and appends to the reflection history.
Drafts persist to `localStorage`.

**3 · Resource & Policy Vault** — a newsletter hub that generates its own
fortnightly issues from the programme start date, marking the current issue live
and counting down to the next; downloads for the **AI Playbook** and **AI
Governance Policy** (the real PDFs, extracted from the original prototype into
`web/public/docs/`); and the four government frameworks projects must sit inside.

**4 · Master Executive Dashboard** — aggregate health, milestone and review
figures; a stage-distribution ring with hover-to-inspect plus a stacked pipeline
bar; per-department health meters ordered worst-first; a pending-review flag
queue; a "needs a nudge" list of stalled projects; a department filter; and a
full sortable-width project table as the accessible fallback view.

**5 · AI Support Widget** — a persistent floating launcher (bottom right) opening
a concierge panel that answers FAQ and policy questions from a keyword knowledge
base, with suggested prompts, typing indicator, cited sources, Markdown answers
and Escape-to-close.

---

## Data

Mock data is **not invented** — it is derived from the real Batch 01 roster in
the original prototype: 19 departments, 34 champions, 9 specialists and 39
projects, with each project's stage mapped from its recorded maturity level and
its health, milestones and freshness derived deterministically so figures are
stable across reloads.

`web/src/data/programme.js` (and its copy in `server/src/data/`) is the generated
dataset; `mockData.js` / `seed-data.js` layer the editorial content on top.
Project recency is stored as `updatedDaysAgo` and resolved against the current
date, so the dashboard never drifts into reading as months stale.

### Swapping mock data for the API

`web/src/lib/api.js` is the single data-access layer. With `VITE_API_URL` unset
it resolves against the bundled dataset; set it and every call switches to the
live endpoint with an identical response shape. No component changes.

| Method | Endpoint |
|---|---|
| `getSession()` | `GET /api/session` |
| `getProgramme()` | `GET /api/programme` |
| `getWorkspace(id)` | `GET /api/champions/:id/workspace` |
| `submitStatus(id, body)` | `POST /api/champions/:id/status` |
| `getResources()` | `GET /api/resources` |
| `getDashboard()` | `GET /api/dashboard` |
| `ask(question)` | `POST /api/assistant` |

---

## Backend architecture

Express 4 with `helmet`, `cors` (explicit origin allowlist), `morgan`, and `zod`
validation on every write. Routes are thin; all logic sits in
`server/src/services/`, each service having two implementations behind one
signature — a Prisma query, and the seed dataset — chosen by whether
`DATABASE_URL` is set. That is what lets the API run before a database exists.

`POST /api/champions/:id/status` is a single transaction: the reflection, any new
proof, the submission record and the project's review flag all move together, so
a partial write can never leave a stage advance without the evidence behind it.

`POST /api/assistant` always runs keyword retrieval over the policy knowledge
base. Without `ANTHROPIC_API_KEY` it returns the matched passage directly; with a
key, the passage is handed to the model as grounding so answers stay inside
programme policy, and a model outage falls back to retrieval rather than taking
the widget down.

The Prisma schema (`server/prisma/schema.prisma`) covers `Department`,
`Champion`, `Project`, `Proof`, `Reflection`, `StatusSubmission`, `ReviewFlag`,
`NewsletterIssue` and `Resource`. `prisma/seed.js` is idempotent — every write is
an upsert on a stable key, so re-running it will not duplicate the cohort.

---

## Accessibility

Semantic landmarks and a skip link; the stage selector is a real listbox with
full keyboard support; `role="meter"` with values and named bands on health
meters; `aria-live` on the assistant log and submission feedback; visible focus
rings on the gold accent; charts carry `<title>`, legends and direct labels;
`prefers-reduced-motion` disables all choreography.

---

## Known limitations

- Uploaded files are held as in-memory object URLs; wiring real object storage
  is the `storageKey` column already present on `Proof`.
- Authentication is stubbed — `GET /api/session` returns a fixed champion.
- Newsletter issues are generated on the cadence; editorial bodies beyond the
  opening run rotate through placeholder copy until issues are written.
- `npm install` was not run in the authoring environment (the package registry is
  blocked by egress policy there), so dependency resolution has not been
  exercised. All sources were parse-checked and the data, analytics, newsletter,
  assistant and API service layers were executed directly against the seed data.
