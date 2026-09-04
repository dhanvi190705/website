import type { EvidenceKind, Stage } from '@prisma/client';

export type TrackerUpdate = {
  id: string;
  fromStage: Stage;
  toStage: Stage;
  note: string;
  createdAt: string;
  authorName: string;
};

export type TrackerEvidence = {
  id: string;
  kind: EvidenceKind;
  label: string;
  note: string | null;
  stage: Stage;
  url: string | null;
  originalName: string | null;
  mimeType: string | null;
  sizeBytes: number | null;
  createdAt: string;
  uploadedByName: string;
};

export type TrackerProject = {
  id: string;
  name: string;
  summary: string | null;
  stage: Stage;
  businessUnitName: string;
  championName: string | null;
  updatedAt: string;
  updates: TrackerUpdate[];
  evidence: TrackerEvidence[];
};
