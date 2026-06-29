import os from "node:os";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));

export function packageRoot(): string {
  let current = here;
  while (current !== path.dirname(current)) {
    if (fs.existsSync(path.join(current, "package.json"))) return current;
    if (path.basename(current) === "dist" && fs.existsSync(path.join(path.dirname(current), "package.json"))) {
      return path.dirname(current);
    }
    current = path.dirname(current);
  }
  return path.resolve(here, "..", "..");
}

export function templatePath(name: string): string {
  return path.join(packageRoot(), "templates", name);
}

export function projectMarkerPath(cwd = process.cwd()): string {
  return path.join(cwd, ".handoff-needed");
}

export function projectStateDir(cwd = process.cwd()): string {
  return path.join(cwd, ".agent-handoff");
}

export function projectStatePath(cwd = process.cwd()): string {
  return path.join(projectStateDir(cwd), "state.json");
}

export function projectHandoffPath(cwd = process.cwd()): string {
  return path.join(cwd, "handoff.md");
}

export function claudeHome(home = os.homedir()): string {
  return path.join(home, ".claude");
}

export function claudeAgentHandoffDir(home = os.homedir()): string {
  return path.join(claudeHome(home), "agent-handoff");
}

export function claudeCommandsDir(home = os.homedir()): string {
  return path.join(claudeHome(home), "commands");
}

export function claudeSettingsPath(home = os.homedir()): string {
  return path.join(claudeHome(home), "settings.json");
}
