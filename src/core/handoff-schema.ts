export const REQUIRED_SECTIONS = [
  "# Handoff",
  "## 1. Objective",
  "## 2. Current Status",
  "## 3. Repo State",
  "## 4. Files Changed",
  "## 5. Key Decisions",
  "## 6. Important Context",
  "## 7. Commands Run",
  "## 8. Known Errors / Blockers",
  "## 9. Next Steps",
  "## 10. Do Not Do",
  "## 11. Verification Plan",
  "## 12. Suggested Prompt For Next Agent",
] as const;

export const NEXT_AGENT_PROMPT = `Read \`handoff.md\` and continue from there.

Do not trust the handoff blindly. First inspect the repository state, run relevant git/status commands, open the mentioned files, and verify the handoff assumptions before editing.

Then continue with the ordered next steps. Preserve all constraints in “Important Context” and “Do Not Do”. Report any mismatch between the handoff and actual repo state before making major changes.`;

export const HANDOFF_TEMPLATE = `# Handoff

## 1. Objective
One-sentence final outcome.

## 2. Current Status
- Complete:
- Partially complete:
- Not started:

## 3. Repo State
- Branch:
- Last known commit:
- Package manager:
- Runtime/framework:
- Important environment assumptions:

## 4. Files Changed
| File | Status | Why it changed |
|---|---|---|

## 5. Key Decisions
Architectural/product decisions already made, with reasoning.

## 6. Important Context
Facts the next agent must preserve:
- API contracts
- naming conventions
- compatibility requirements
- security constraints
- user preferences/constraints

## 7. Commands Run
| Command | Result |
|---|---|

## 8. Known Errors / Blockers
Exact errors, failing tests, stack traces, missing information, or unresolved issues.

## 9. Next Steps
Ordered, concrete, executable steps.

## 10. Do Not Do
Things the next agent must avoid.

## 11. Verification Plan
Commands/checks that prove the task is complete.

## 12. Suggested Prompt For Next Agent
${NEXT_AGENT_PROMPT}
`;
