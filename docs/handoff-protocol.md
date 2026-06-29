# Handoff Protocol

The universal protocol has three project files:

- `.handoff-needed`: marker that tells the current agent to stop normal work and write `handoff.md`.
- `.agent-handoff/state.json`: machine-readable trigger metadata.
- `handoff.md`: human-readable transfer document for the next agent.

The required handoff schema is intentionally agent-neutral and concrete. It must include objective, current status, repo state, files changed, decisions, context, commands, blockers, next steps, things to avoid, verification plan, and a suggested prompt.

Agents must verify the current repository state before trusting the handoff.
