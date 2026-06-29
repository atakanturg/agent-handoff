import fs from "node:fs";
import path from "node:path";
import { claudeAgentHandoffDir, claudeCommandsDir } from "../../core/paths.js";
import { uninstallClaudeSettings, updateClaudeSettingsOnDisk } from "../../core/settings-writer.js";

export interface ClaudeUninstallResult {
  removed: string[];
  backupPath?: string;
}

export function uninstallClaudeCode(home: string): ClaudeUninstallResult {
  const removed: string[] = [];
  const files = [
    path.join(claudeAgentHandoffDir(home), "statusline-handoff-watch.sh"),
    path.join(claudeAgentHandoffDir(home), "handoff-required-hook.sh"),
    path.join(claudeCommandsDir(home), "handoff.md"),
  ];
  for (const file of files) {
    if (fs.existsSync(file)) {
      fs.unlinkSync(file);
      removed.push(file);
    }
  }
  const dir = claudeAgentHandoffDir(home);
  if (fs.existsSync(dir) && fs.readdirSync(dir).length === 0) fs.rmdirSync(dir);
  const result = updateClaudeSettingsOnDisk(home, uninstallClaudeSettings);
  return { removed, backupPath: result.backupPath };
}
