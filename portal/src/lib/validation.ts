import { z } from 'zod';
import { Role, EvidenceKind } from '@prisma/client';
import { STAGE_IDS } from './stages';

const stageEnum = z.enum(STAGE_IDS as unknown as [string, ...string[]]);

export const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});

export const setupSchema = z.object({
  name: z.string().trim().min(2, 'Enter a name.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.'),
  password: z.string().min(10, 'Password must be at least 10 characters.').max(200),
});

export const createUserSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(10).max(200),
  role: z.nativeEnum(Role),
  businessUnitId: z.string().trim().min(1).nullable().optional(),
});

export const updateUserSchema = z.object({
  id: z.string().min(1),
  active: z.boolean().optional(),
  role: z.nativeEnum(Role).optional(),
  businessUnitId: z.string().trim().min(1).nullable().optional(),
  password: z.string().min(10).max(200).optional(),
});

export const businessUnitSchema = z.object({
  name: z.string().trim().min(2, 'Enter a business unit name.').max(120),
  code: z.string().trim().max(12).optional().nullable(),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(3, 'Enter a project name.').max(200),
  summary: z.string().trim().max(4000).optional().nullable(),
  businessUnitId: z.string().trim().min(1, 'Select a business unit.'),
  championId: z.string().trim().min(1).nullable().optional(),
});

export const assignProjectSchema = z.object({
  id: z.string().min(1),
  championId: z.string().trim().min(1).nullable(),
});

export const progressSchema = z.object({
  stage: stageEnum,
  note: z
    .string()
    .trim()
    .min(10, 'Add a short note describing what moved — at least 10 characters.')
    .max(4000),
});

export const evidenceLinkSchema = z.object({
  kind: z.literal(EvidenceKind.LINK),
  label: z.string().trim().min(2, 'Give the evidence a label.').max(200),
  url: z.string().trim().url('Enter a full URL starting with http:// or https://'),
  note: z.string().trim().max(2000).optional().nullable(),
});

export const announcementSchema = z.object({
  title: z.string().trim().min(3, 'Enter a title.').max(200),
  body: z.string().trim().min(10, 'Write the announcement body.').max(20000),
  pinned: z.boolean().optional().default(false),
  publish: z.boolean().optional().default(true),
});

export const assistantSchema = z.object({
  question: z.string().trim().min(1).max(2000),
  history: z
    .array(z.object({ role: z.enum(['user', 'assistant']), text: z.string().max(8000) }))
    .max(12)
    .optional()
    .default([]),
});

/** Turn a ZodError into `{ field: message }` for inline form display. */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
