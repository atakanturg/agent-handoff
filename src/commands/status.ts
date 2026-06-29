import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { claudeAgentHandoffDir, claudeSettingsPath, projectHandoffPath, projectMarkerPath } from "../core/paths.js";
import { readState } from "../core/state.js";
import { readSettingsFile } from "../core/settings-writer.js";

export interface StatusInfo {
  installedAdapters: string[];
  markerNeeded: boolean;
  handoffPath?: string;
  claude?: {
    threshold?: string;
    mode?: string;
  };
}

function matchEnv(command: string, key: string): string | undefined {
  return command.match(new RegExp(`${key}=([^\\s]+)`))?.[1];
}

function findCommands(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (Array.isArray(value)) return value.flatMap(findCommands);
  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    return [
      typeof record.command === "string" ? record.command : undefined,
      ...Object.values(record).flatMap(findCommands),
    ].filter((command): command is string => Boolean(command));
  }
  return [];
}

export function getStatus(cwd = process.cwd(), home = os.homedir()): StatusInfo {
  const installedAdapters: string[] = [];
  const claudeDir = claudeAgentHandoffDir(home);
  if (fs.existsSync(path.join(claudeDir, "statusline-handoff-watch.sh"))) installedAdapters.push("claude-code");
  const info: StatusInfo = {
    installedAdapters,
    markerNeeded: fs.existsSync(projectMarkerPath(cwd)),
    handoffPath: fs.existsSync(projectHandoffPath(cwd)) ? projectHandoffPath(cwd) : undefined,
  };
  const settingsFile = claudeSettingsPath(home);
  if (fs.existsSync(settingsFile)) {
    const settings = readSettingsFile(settingsFile);
    const statusCommand = typeof settings.statusLine === "object" && settings.statusLine && "command" in settings.statusLine
      ? String((settings.statusLine as { command?: unknown }).command ?? "")
      : typeof settings.statusLine === "string"
        ? settings.statusLine
        : "";
    const hookCommand = findCommands(settings.hooks).find((command) => command.includes("handoff-required-hook.sh")) ?? "";
    const state = readState(cwd);
    info.claude = {
      threshold: matchEnv(statusCommand, "AGENT_HANDOFF_THRESHOLD") ?? (state?.threshold ? String(state.threshold) : undefined),
      mode: matchEnv(hookCommand, "AGENT_HANDOFF_MODE") ?? state?.mode,
    };
  }
  return info;
}

export function formatStatus(info: StatusInfo): string {
  return [
    `Installed adapters: ${info.installedAdapters.length ? info.installedAdapters.join(", ") : "none"}`,
    `Project marker: ${info.markerNeeded ? "needed" : "not present"}`,
    `Claude Code threshold: ${info.claude?.threshold ?? "unknown"}`,
    `Claude Code mode: ${info.claude?.mode ?? "unknown"}`,
    `handoff.md: ${info.handoffPath ?? "not present"}`,
  ].join("\n");
}
