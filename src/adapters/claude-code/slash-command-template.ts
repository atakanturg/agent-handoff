import { HANDOFF_TEMPLATE, NEXT_AGENT_PROMPT } from "../../core/handoff-schema.js";

export function slashCommandTemplate(): string {
  return `# Handoff

Create or update \`handoff.md\` in the current project using the universal agent-handoff schema below.

Rules:
- Stop normal implementation work while writing the handoff.
- Inspect the current repository state before writing.
- Include exact paths, commands, errors, assumptions, blockers, and verification steps.
- Never claim tests pass unless command output supports it.
- Never omit failing command output.
- Never overwrite unrelated user work.
- Include this ready-to-paste next-agent prompt:

\`\`\`txt
${NEXT_AGENT_PROMPT}
\`\`\`

After writing \`handoff.md\`, remove \`.handoff-needed\` if it exists and tell the user the handoff is ready.

\`\`\`md
${HANDOFF_TEMPLATE}
\`\`\`
`;
}
