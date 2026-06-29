import fs from "node:fs";
import { claudeSettingsPath } from "../core/paths.js";

export function runDoctor(home: string): string[] {
  const messages: string[] = [];
  messages.push("agent-handoff doctor");
  messages.push(`Node.js: ${process.version}`);
  messages.push(`jq: required by Claude Code scripts; run 'jq --version' to verify availability.`);
  const settings = claudeSettingsPath(home);
  messages.push(fs.existsSync(settings) ? `Claude settings: ${settings}` : `Claude settings: not present; install can create ${settings}`);
  messages.push("Protocol: universal handoff.md; automatic context detection is adapter-specific.");
  return messages;
}
