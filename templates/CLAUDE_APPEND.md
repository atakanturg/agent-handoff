<!-- agent-handoff:start -->
Agent handoff protocol:

- At the beginning of each response, check whether `.handoff-needed` exists in the project root.
- If it exists, stop normal implementation work.
- Inspect the current repository state, then create or update `handoff.md`.
- Use the universal handoff schema with all required sections:
  Objective, Current Status, Repo State, Files Changed, Key Decisions, Important Context, Commands Run, Known Errors / Blockers, Next Steps, Do Not Do, Verification Plan, and Suggested Prompt For Next Agent.
- Be concrete: include exact paths, commands, errors, assumptions, blockers, verification steps, and a ready-to-paste continuation prompt.
- Never claim tests pass unless command output supports it.
- Never overwrite unrelated user work.
- After writing `handoff.md`, remove `.handoff-needed`.
- Tell the user the handoff is ready.
<!-- agent-handoff:end -->
