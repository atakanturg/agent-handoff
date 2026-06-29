# Claude Code Adapter

The Claude Code adapter installs a status-line watcher and a hook script under `~/.claude/agent-handoff/`.

The watcher reads status-line JSON from stdin with `jq`, checks `.context_window.used_percentage`, and creates `.handoff-needed` plus `.agent-handoff/state.json` when the configured threshold is reached.

The hook checks for `.handoff-needed` and either allows, warns, or blocks depending on `AGENT_HANDOFF_MODE`.

The adapter never calls Claude, Codex, Gemini, or any LLM.
