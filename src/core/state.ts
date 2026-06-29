import fs from "node:fs";
import { projectStateDir, projectStatePath } from "./paths.js";

export interface HandoffState {
  version: 1;
  needed: boolean;
  reason: string;
  triggeredBy: string;
  createdAt: string;
  updatedAt: string;
  cwd: string;
  threshold?: number;
  usedPercentage?: number;
  mode?: string;
}

export function readState(cwd = process.cwd()): HandoffState | undefined {
  const file = projectStatePath(cwd);
  if (!fs.existsSync(file)) return undefined;
  return JSON.parse(fs.readFileSync(file, "utf8")) as HandoffState;
}

export function writeState(
  cwd: string,
  state: Omit<HandoffState, "version" | "createdAt" | "updatedAt" | "cwd"> & Partial<Pick<HandoffState, "createdAt" | "cwd">>,
): HandoffState {
  const now = new Date().toISOString();
  const previous = readState(cwd);
  const next: HandoffState = {
    version: 1,
    createdAt: state.createdAt ?? previous?.createdAt ?? now,
    updatedAt: now,
    cwd: state.cwd ?? cwd,
    needed: state.needed,
    reason: state.reason,
    triggeredBy: state.triggeredBy,
    threshold: state.threshold,
    usedPercentage: state.usedPercentage,
    mode: state.mode,
  };
  fs.mkdirSync(projectStateDir(cwd), { recursive: true });
  fs.writeFileSync(projectStatePath(cwd), `${JSON.stringify(next, null, 2)}\n`);
  return next;
}
