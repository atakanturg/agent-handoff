import fs from "node:fs";
import path from "node:path";

export const START = "<!-- agent-handoff:start -->";
export const END = "<!-- agent-handoff:end -->";

export function handoffClaudeBlock(): string {
  return `${START}
Agent handoff protocol:

- At the beginning of each response, check whether \`.handoff-needed\` exists in the project root.
- If it exists, stop normal implementation work.
- Inspect the current repository state, then create or update \`handoff.md\`.
- Use the universal handoff schema with all required sections:
  Objective, Current Status, Repo State, Files Changed, Key Decisions, Important Context, Commands Run, Known Errors / Blockers, Next Steps, Do Not Do, Verification Plan, and Suggested Prompt For Next Agent.
- Be concrete: include exact paths, commands, errors, assumptions, blockers, verification steps, and a ready-to-paste continuation prompt.
- Never claim tests pass unless command output supports it.
- Never overwrite unrelated user work.
- After writing \`handoff.md\`, remove \`.handoff-needed\`.
- Tell the user the handoff is ready.
${END}`;
}

export function upsertDelimitedBlock(existing: string, block = handoffClaudeBlock()): string {
  const pattern = new RegExp(`${START.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s\\S]*?${END.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`);
  if (pattern.test(existing)) return `${existing.replace(pattern, block).trimEnd()}\n`;
  const spacer = existing.trim().length > 0 ? "\n\n" : "";
  return `${existing.trimEnd()}${spacer}${block}\n`;
}

export function initProject(cwd = process.cwd()): string {
  const file = path.join(cwd, "CLAUDE.md");
  const existing = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
  fs.writeFileSync(file, upsertDelimitedBlock(existing));
  return file;
}
