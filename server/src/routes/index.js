import { Router } from 'express';
import { z } from 'zod';
import asyncHandler from '../middleware/asyncHandler.js';
import { badRequest } from '../lib/errors.js';
import { usePrisma } from '../lib/env.js';
import { currentUser } from '../data/seed-data.js';
import { getProgramme } from '../services/programme-service.js';
import { getWorkspace, submitStatus } from '../services/workspace-service.js';
import { getResources } from '../services/resource-service.js';
import { getDashboard } from '../services/dashboard-service.js';
import { ask } from '../services/assistant-service.js';

const router = Router();

/* ------------------------------- schemas -------------------------------- */

const stageSchema = z.enum(['ideation', 'poc', 'validation', 'production', 'scaling']);

const statusSchema = z.object({
  projectId: z.string().min(1),
  stage: stageSchema,
  proofs: z
    .array(
      z.object({
        kind: z.enum(['link', 'repo', 'screenshot', 'document']),
        name: z.string().min(1).max(300),
        detail: z.string().max(2000).optional().default(''),
        size: z.number().int().nonnegative().nullable().optional(),
      }),
    )
    .max(25)
    .optional()
    .default([]),
  reflection: z
    .object({
      wins: z.string().max(8000).optional().default(''),
      blockers: z.string().max(8000).optional().default(''),
      learnings: z.string().max(8000).optional().default(''),
    })
    .default({ wins: '', blockers: '', learnings: '' }),
});

const askSchema = z.object({
  question: z.string().min(1).max(1000),
  history: z
    .array(z.object({ role: z.string(), text: z.string().optional(), content: z.string().optional() }))
    .max(20)
    .optional()
    .default([]),
});

/** Parse a body against a schema, or fail with a 400 that says what was wrong. */
function parse(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    throw badRequest('Invalid request body', result.error.flatten().fieldErrors);
  }
  return result.data;
}

/* -------------------------------- routes -------------------------------- */

router.get('/health', (req, res) => {
  res.json({
    ok: true,
    dataSource: usePrisma ? 'postgres' : 'seed',
    uptimeSeconds: Math.round(process.uptime()),
  });
});

// The signed-in champion. Replace with a real session once auth is wired up.
router.get(
  '/session',
  asyncHandler(async (req, res) => {
    res.json({ user: currentUser });
  }),
);

router.get(
  '/programme',
  asyncHandler(async (req, res) => {
    res.json(await getProgramme());
  }),
);

router.get(
  '/champions/:championId/workspace',
  asyncHandler(async (req, res) => {
    res.json(await getWorkspace(req.params.championId));
  }),
);

router.post(
  '/champions/:championId/status',
  asyncHandler(async (req, res) => {
    const payload = parse(statusSchema, req.body);
    const submission = await submitStatus(req.params.championId, payload);
    res.status(201).json(submission);
  }),
);

router.get(
  '/resources',
  asyncHandler(async (req, res) => {
    res.json(await getResources());
  }),
);

router.get(
  '/dashboard',
  asyncHandler(async (req, res) => {
    res.json(await getDashboard());
  }),
);

router.post(
  '/assistant',
  asyncHandler(async (req, res) => {
    const { question, history } = parse(askSchema, req.body);
    res.json(await ask(question, history));
  }),
);

export default router;
