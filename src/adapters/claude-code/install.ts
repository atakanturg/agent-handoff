import fs from "node:fs";
import path from "node:path";
import { claudeAgentHandoffDir, claudeCommandsDir } from "../../core/paths.js";
import type { ClaudeInstallOptions } from "../../core/config.js";
import { updateClaudeSettingsOnDisk, installClaudeSettings } from "../../core/settings-writer.js";
import { statuslineScriptTemplate } from "./statusline-template.js";
import { hookScriptTemplate } from "./hook-template.js";
import { slashCommandTemplate } from "./slash-command-template.js";

export interface ClaudeInstallResult {
  files: string[];
  backupPath?: string;
}

export function installClaudeCode(home: string, options: ClaudeInstallOptions): ClaudeInstallResult {
  const dir = claudeAgentHandoffDir(home);
  const commandsDir = claudeCommandsDir(home);
  fs.mkdirSync(dir, { recursive: true });
  fs.mkdirSync(commandsDir, { recursive: true });

  const statusline = path.join(dir, "statusline-handoff-watch.sh");
  const hook = path.join(dir, "handoff-required-hook.sh");
  const slash = path.join(commandsDir, "handoff.md");
  fs.writeFileSync(statusline, statuslineScriptTemplate());
  fs.writeFileSync(hook, hookScriptTemplate());
  fs.writeFileSync(slash, slashCommandTemplate());
  fs.chmodSync(statusline, 0o755);
  fs.chmodSync(hook, 0o755);

  const result = updateClaudeSettingsOnDisk(home, (current) =>
    installClaudeSettings(current, {
      threshold: options.threshold,
      mode: options.mode,
      force: options.force,
    }),
  );

  return { files: [statusline, hook, slash], backupPath: result.backupPath };
}
