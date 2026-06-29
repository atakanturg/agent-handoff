import os from "node:os";
import { parseMode, parseThreshold, type ClaudeInstallOptions } from "../core/config.js";
import { installClaudeCode } from "../adapters/claude-code/install.js";

export function parseInstallOptions(flags: Record<string, string | boolean | undefined>): ClaudeInstallOptions {
  return {
    threshold: parseThreshold(typeof flags.threshold === "string" ? flags.threshold : undefined),
    mode: parseMode(typeof flags.mode === "string" ? flags.mode : undefined),
    yes: flags.yes === true,
    force: flags.force === true,
  };
}

export function runInstall(adapter: string, flags: Record<string, string | boolean | undefined>, home = os.homedir()) {
  if (adapter !== "claude-code") throw new Error("install supports: claude-code");
  return installClaudeCode(home, parseInstallOptions(flags));
}
