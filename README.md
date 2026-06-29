# agent-handoff

`agent-handoff` is an open-source that automatically makes it so that when a coding agent is near their quote they create a handoff.md allowing you to seamlessly move between tools (like claude code, codex, antigravity, etc.)

It is built as a universal handoff protocol plus agent-specific adapters. The protocol is `handoff.md`, `.handoff-needed`, and `.agent-handoff/state.json`. Only context-usage detection is agent-specific.

Release: `0.1.0-beta.0`. Ready for dogfooding and feedback, not yet production-hardened across every agent and platform.

## install

```bash
npm install -g .
```

```bash
npm i @atakanturgut/agent-handoff
```

## What Problem This Solves

AI coding agents can run out of useful context mid-task. A clean handoff lets the current agent stop, write down exact repo state and next steps, and let Codex, Claude Code, Gemini CLI, Cursor agents, Aider, or a generic agent resume safely.

## Protocol vs Adapters

- Universal protocol: `handoff.md`, `.handoff-needed`, `.agent-handoff/state.json`, and `agent-handoff validate`.
- Claude Code adapter: v1 trigger adapter using status-line and hook surfaces.
- Codex adapter: v1 consumer prompt for resuming from `handoff.md`.
- Gemini adapter: v1 consumer prompt for resuming from `handoff.md`.
- Generic/manual adapter: `agent-handoff mark` works anywhere.

V1 uses Claude Code status-line integration because it is an explicit supported surface for current context data. It does not use hidden Claude CLI behavior, `/usage` polling, transcript JSONL scraping, a daemon, or paid API calls.


The npm package is scoped because the unscoped `agent-handoff` name is already taken. The installed CLI command is still `agent-handoff`.

## Claude Code Setup

```bash
agent-handoff install claude-code --threshold 90 --mode warn --yes
```

This writes `~/.claude/agent-handoff/statusline-handoff-watch.sh`, `~/.claude/agent-handoff/handoff-required-hook.sh`, and `~/.claude/commands/handoff.md`.

It updates `~/.claude/settings.json`, creates a timestamped backup first, preserves unrelated settings, and refuses to replace an existing non-agent-handoff `statusLine` unless `--force` is passed.

Modes:

- `marker`: create marker/state and allow continuation.
- `warn`: warn when `.handoff-needed` exists.
- `block`: block with instructions until the agent writes `handoff.md`.

## Project Setup

```bash
agent-handoff init-project --yes
```

This creates or updates `CLAUDE.md` with one delimited block. Repeated runs update the block instead of duplicating it.

## Manual Usage For Any Agent

```bash
agent-handoff mark
```

This creates `.handoff-needed` and `.agent-handoff/state.json`. Any agent instructed by the project prompt can see the marker, stop normal work, write `handoff.md`, remove the marker, and tell the user the handoff is ready.

## Codex Continuation

```bash
agent-handoff print-prompt codex
```

Paste the printed prompt into Codex. It tells Codex to read `handoff.md`, inspect the real repo state first, verify assumptions, and continue from the listed next steps.

## Gemini Continuation

```bash
agent-handoff print-prompt gemini
```

Paste the printed prompt into Gemini CLI or another Gemini-based coding agent.

## Validation

```bash
agent-handoff validate handoff.md
```

Validation fails when required sections are missing. It warns when files, commands, next steps, next-agent prompt, blockers, Do Not Do, or verification evidence are weak or missing.

## Status

```bash
agent-handoff status
```

Shows installed adapters, marker state, Claude threshold/mode where detectable, and whether `handoff.md` exists.

## Uninstall

```bash
agent-handoff uninstall claude-code --yes
```

Uninstall removes only files and settings owned by `agent-handoff`. It backs up settings before mutation and preserves unrelated Claude settings.

## Limitations

- V1 automatic context triggers are adapter-specific.
- Claude Code is the only v1 trigger adapter.
- Codex and Gemini are consumer adapters in v1.
- No GUI.
- No cloud service.
- No automatic semantic summarization.
- No hidden Claude CLI or `/usage` polling.
- No transcript scraping.

## Non-Goals For V1

- Hidden Claude CLI.
- `/usage` polling.
- Parsing Claude transcript JSONL.
- Automatic summary via paid LLM call.
- Supporting every agent's context telemetry.
- GUI.
- Cloud service.
