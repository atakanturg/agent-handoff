import fs from "node:fs";
import path from "node:path";
import { claudeSettingsPath } from "./paths.js";
import type { ClaudeInstallOptions } from "./config.js";

export interface SettingsWriteResult {
  settings: Record<string, unknown>;
  backupPath?: string;
}

const STATUSLINE_COMMAND = "~/.claude/agent-handoff/statusline-handoff-watch.sh";
const HOOK_COMMAND = "~/.claude/agent-handoff/handoff-required-hook.sh";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function commandContains(value: unknown, needle: string): boolean {
  return isRecord(value) && typeof value.command === "string" && value.command.includes(needle);
}

export function isAgentHandoffStatusLine(value: unknown): boolean {
  if (typeof value === "string") return value.includes(STATUSLINE_COMMAND);
  return commandContains(value, STATUSLINE_COMMAND);
}

export function makeStatusLine(threshold: number): Record<string, unknown> {
  return {
    type: "command",
    command: `AGENT_HANDOFF_THRESHOLD=${threshold} ${STATUSLINE_COMMAND}`,
  };
}

export function makeHook(mode: string): Record<string, unknown> {
  return {
    matcher: "*",
    hooks: [
      {
        type: "command",
        command: `AGENT_HANDOFF_MODE=${mode} ${HOOK_COMMAND}`,
      },
    ],
    agentHandoffOwned: true,
  };
}

function removeOwnedHookEntries(hooks: unknown): Record<string, unknown[]> {
  if (!isRecord(hooks)) return {};
  const next: Record<string, unknown[]> = {};
  for (const [event, entries] of Object.entries(hooks)) {
    if (!Array.isArray(entries)) {
      next[event] = [entries];
      continue;
    }
    const filtered = entries.filter((entry) => {
      if (!isRecord(entry)) return true;
      if (entry.agentHandoffOwned === true) return false;
      const nested = Array.isArray(entry.hooks) ? entry.hooks : [];
      return !nested.some((hook) => commandContains(hook, HOOK_COMMAND));
    });
    if (filtered.length > 0) next[event] = filtered;
  }
  return next;
}

export function installClaudeSettings(
  current: Record<string, unknown>,
  options: Pick<ClaudeInstallOptions, "threshold" | "mode" | "force">,
): Record<string, unknown> {
  const next = structuredClone(current);
  const existingStatusLine = next.statusLine;
  if (existingStatusLine !== undefined && !isAgentHandoffStatusLine(existingStatusLine) && !options.force) {
    throw new Error("Claude settings already contain a statusLine. Re-run with --force to replace it after backup.");
  }
  next.statusLine = makeStatusLine(options.threshold);
  const hooks = removeOwnedHookEntries(next.hooks);
  hooks.UserPromptSubmit = [...(hooks.UserPromptSubmit ?? []), makeHook(options.mode)];
  next.hooks = hooks;
  return next;
}

export function uninstallClaudeSettings(current: Record<string, unknown>): Record<string, unknown> {
  const next = structuredClone(current);
  if (isAgentHandoffStatusLine(next.statusLine)) delete next.statusLine;
  const hooks = removeOwnedHookEntries(next.hooks);
  if (Object.keys(hooks).length > 0) next.hooks = hooks;
  else delete next.hooks;
  return next;
}

export function readSettingsFile(file: string): Record<string, unknown> {
  if (!fs.existsSync(file)) return {};
  try {
    const parsed = JSON.parse(fs.readFileSync(file, "utf8"));
    if (!isRecord(parsed)) throw new Error("settings root must be a JSON object");
    return parsed;
  } catch (error) {
    throw new Error(`Cannot update ${file}: invalid JSON (${(error as Error).message})`);
  }
}

export function backupSettings(file: string): string | undefined {
  if (!fs.existsSync(file)) return undefined;
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backup = `${file}.agent-handoff-backup-${stamp}`;
  fs.copyFileSync(file, backup);
  return backup;
}

export function writeSettingsFile(file: string, settings: Record<string, unknown>): void {
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, `${JSON.stringify(settings, null, 2)}\n`);
}

export function updateClaudeSettingsOnDisk(
  home: string,
  updater: (current: Record<string, unknown>) => Record<string, unknown>,
): SettingsWriteResult {
  const file = claudeSettingsPath(home);
  const current = readSettingsFile(file);
  const backupPath = backupSettings(file);
  const settings = updater(current);
  writeSettingsFile(file, settings);
  return { settings, backupPath };
}
