# Adapter Contract

Adapters may trigger, consume, or assist with handoffs.

Trigger adapters may create `.handoff-needed` and `.agent-handoff/state.json`. They must not overwrite `handoff.md`, call an LLM, scrape transcripts, or mutate unrelated project files.

Consumer adapters provide prompts or instructions for reading `handoff.md` and resuming safely. They must tell the next agent to verify repo state before editing.
