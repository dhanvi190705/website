import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export const STAGE_LABELS: Record<string, string> = {
  IDEATION_AND_SOLUTION_DEFINITION: "Ideation & Solution Definition",
  FEASIBILITY_AND_SCOPING: "Feasibility & Scoping",
  DEVELOPMENT_AND_INTEGRATION: "Development & Integration",
  TESTING_AND_PILOT_DEPLOYMENT: "Testing & Pilot Deployment",
  FULL_ADOPTION_AND_VALUE_REALIZATION: "Full Adoption & Value Realization",
};

export const STAGE_ORDER = [
  "IDEATION_AND_SOLUTION_DEFINITION",
  "FEASIBILITY_AND_SCOPING",
  "DEVELOPMENT_AND_INTEGRATION",
  "TESTING_AND_PILOT_DEPLOYMENT",
  "FULL_ADOPTION_AND_VALUE_REALIZATION",
] as const;

export const STATUS_LABELS: Record<string, string> = {
  ACTIVE: "Active",
  ON_HOLD: "On Hold",
  COMPLETED: "Completed",
  CANCELLED: "Cancelled",
};

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let value = bytes / 1024;
  let unitIndex = 0;
  while (value >= 1024 && unitIndex < units.length - 1) {
    value /= 1024;
    unitIndex += 1;
  }
  return `${value.toFixed(1)} ${units[unitIndex]}`;
}
