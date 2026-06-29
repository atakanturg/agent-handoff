# Codex

Codex is a v1 consumer adapter.

Run:

```bash
agent-handoff print-prompt codex
```

Paste the prompt into Codex in the target repository. Codex should read `handoff.md`, inspect git and project state, open mentioned files, verify assumptions, and then continue from the ordered next steps.
