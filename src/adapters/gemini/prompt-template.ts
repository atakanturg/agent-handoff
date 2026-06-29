import { NEXT_AGENT_PROMPT } from "../../core/handoff-schema.js";

export function geminiPrompt(): string {
  return `Read \`handoff.md\` and continue from there.

Do not trust the handoff blindly. First inspect the repository state, run relevant status/check commands, open the mentioned files, and verify the handoff assumptions before editing.

Then continue with the ordered next steps. Preserve all constraints in “Important Context” and “Do Not Do”. Report any mismatch between the handoff and actual repo state before making major changes.`;
}
