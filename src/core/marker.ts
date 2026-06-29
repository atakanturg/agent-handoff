import fs from "node:fs";
import { projectMarkerPath } from "./paths.js";
import { writeState, type HandoffState } from "./state.js";

export interface MarkOptions {
  cwd?: string;
  reason?: string;
  triggeredBy?: string;
  threshold?: number;
  usedPercentage?: number;
  mode?: string;
}

export function markHandoffNeeded(options: MarkOptions = {}): HandoffState {
  const cwd = options.cwd ?? process.cwd();
  const marker = projectMarkerPath(cwd);
  if (!fs.existsSync(marker)) {
    fs.writeFileSync(marker, "Create or update handoff.md before continuing normal work.\n");
  }
  return writeState(cwd, {
    needed: true,
    reason: options.reason ?? "manual marker requested",
    triggeredBy: options.triggeredBy ?? "manual",
    threshold: options.threshold,
    usedPercentage: options.usedPercentage,
    mode: options.mode,
  });
}

export function clearMarker(cwd = process.cwd()): void {
  const marker = projectMarkerPath(cwd);
  if (fs.existsSync(marker)) fs.unlinkSync(marker);
}

export function markerExists(cwd = process.cwd()): boolean {
  return fs.existsSync(projectMarkerPath(cwd));
}
