export type HandoffMode = "marker" | "warn" | "block";

export interface ClaudeInstallOptions {
  threshold: number;
  mode: HandoffMode;
  yes: boolean;
  force: boolean;
}

export function parseThreshold(value: string | undefined): number {
  if (value === undefined) return 90;
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 100) {
    throw new Error("--threshold must be a number from 0 to 100");
  }
  return parsed;
}

export function parseMode(value: string | undefined): HandoffMode {
  if (value === undefined) return "marker";
  if (value === "marker" || value === "warn" || value === "block") return value;
  throw new Error("--mode must be one of marker, warn, or block");
}
