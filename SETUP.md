# Running AI NEXT locally

Step-by-step, from a fresh machine to the app open in your browser.

---

## 1. Install Node.js

You need **Node 18 or newer** (Node 20 LTS recommended).

- Download: https://nodejs.org (pick the LTS build)
- Check it worked — open a terminal and run:

```bash
node -v      # should print v18.x or higher
npm -v       # should print 9.x or higher
```

If `node` is not recognised after installing, close and reopen the terminal.

---

## 2. Open the project folder

Unzip `ai-next.zip` somewhere you can find it, then `cd` into the **web** folder.

**macOS / Linux**
```bash
cd ~/Downloads/ai-next/web
```

**Windows (PowerShell)**
```powershell
cd $HOME\Downloads\ai-next\web
```

Confirm you are in the right place — `ls` (or `dir` on Windows) should show
`package.json`, `index.html` and a `src` folder.

---

## 3. Install dependencies

```bash
npm install
```

This downloads React, Tailwind, Framer Motion and Lucide into a `node_modules`
folder. It takes 1–3 minutes the first time and prints a summary when done.

> A few `npm warn deprecated` lines are normal and safe to ignore. Only a line
> starting with `npm error` means something actually failed.

---

## 4. Start the app

```bash
npm run dev
```

You will see:

```
  VITE v5.x.x  ready in ### ms
  ➜  Local:   http://localhost:5173/
```

Open **http://localhost:5173** in your browser.

That is it — the full app runs on bundled data. No database, no API key, no
backend needed. Every section is interactive:

- **Pioneer Vision** — click any milestone on the path to open it
- **Champion Workspace** — change the stage, drag a file or paste a link into the
  dropzone, write a reflection (it takes Markdown), hit Submit
- **Vault** — download the Playbook and Governance Policy PDFs
- **Dashboard** — hover the distribution ring, filter by department
- **Concierge** — the gold button, bottom right; ask it about policy or stages

To stop the server, press `Ctrl + C` in the terminal.

---

## 5. Build for production (optional)

```bash
npm run build      # outputs static files into web/dist
npm run preview    # serves that build at http://localhost:4173
```

Everything in `web/dist` is static — it can be dropped on any web host,
internal server, S3 bucket or IIS site.

---

## 6. Run the API too (optional)

Only needed when you want data to persist beyond the browser. In a **second**
terminal:

```bash
cd ai-next/server
npm install
cp .env.example .env      # Windows PowerShell: copy .env.example .env
npm run dev
```

The API starts on http://localhost:4000 and runs on the same seed dataset —
you do **not** need PostgreSQL for this step. Check it with:

```
http://localhost:4000/api/health
```

The frontend's dev server already proxies `/api` to port 4000, so with both
running the SPA will talk to the API instead of its bundled data.

---

## 7. Add PostgreSQL (optional, for real persistence)

1. Install PostgreSQL and create an empty database, e.g. `ai_next`.
2. Open `server/.env` and set the connection string:

```
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/ai_next?schema=public"
```

3. Create the tables and load the Batch 01 roster:

```bash
cd ai-next/server
npm run prisma:migrate     # creates the schema
npm run seed               # loads departments, champions, projects
npm run dev
```

`npm run seed` is safe to run more than once — it upserts, so it will not
duplicate anyone.

To browse the data visually: `npm run prisma:studio`.

---

## 8. Connect the assistant to a real model (optional)

The concierge answers from a built-in policy knowledge base by default. To put a
model behind it, add to `server/.env`:

```
ANTHROPIC_API_KEY=sk-ant-...
```

Answers are grounded on the retrieved policy passage, and if the model call
fails the widget falls back to the built-in answers rather than going down.

---

## Troubleshooting

**`npm error code EACCES` / permission denied (macOS or Linux)**
Do not use `sudo npm install`. Make sure you own the folder:
`sudo chown -R $(whoami) ~/Downloads/ai-next`

**`Port 5173 is already in use`**
Something else is on that port. Run `npm run dev -- --port 5174` and open
http://localhost:5174 instead.

**Blank white page in the browser**
Open the browser console (F12 → Console). If it mentions a missing module, stop
the server, delete `node_modules` and `package-lock.json`, then run
`npm install` again.

**The page loads but has no styling**
Tailwind did not compile. Confirm `tailwind.config.js` and `postcss.config.js`
are in the `web` folder, then restart `npm run dev` — config changes are only
picked up on start.

**An install fails on a specific version**
The version pins in `package.json` were not install-tested in the environment
this was authored in (its package registry was blocked). If one is unavailable,
the fix is normally to relax that single entry — e.g. change
`"vite": "^5.4.11"` to `"vite": "^5"` — and re-run `npm install`.

**`npm run dev` in `server/` fails with a Prisma error**
You have a `DATABASE_URL` set but no reachable database. Either start
PostgreSQL, or blank that line in `.env` to fall back to the seed dataset.

---

## Where things live

```
ai-next/
├── web/
│   ├── src/sections/        the four main screens
│   ├── src/components/ui/   glass cards, buttons, meters, charts
│   ├── src/data/            the Batch 01 dataset and editorial copy
│   ├── src/lib/api.js       swap mock data for the API here
│   ├── public/docs/         the Playbook and Governance Policy PDFs
│   └── tailwind.config.js   the gold/black palette and motion
└── server/
    ├── src/routes/          the API surface
    ├── src/services/        business logic (works with or without a DB)
    └── prisma/schema.prisma the database model
```

To change the champion who is "signed in", edit `currentUser` in
`web/src/data/mockData.js`.
