# Security

`agent-handoff` v1 is intentionally local and low-privilege.

- No transcript scraping in v1.
- No background daemon.
- No LLM/API calls from the watcher.
- The watcher only writes marker/state files in the current project.
- Claude settings are backed up before mutation.
- Uninstall removes only settings and files owned by `agent-handoff`.
- The tool does not exfiltrate code, prompts, transcripts, or metadata.
- `handoff.md` is never overwritten by the watcher.
