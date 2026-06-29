# Troubleshooting

## Existing Claude statusLine

Install refuses to overwrite an existing non-agent-handoff `statusLine` by default. Re-run with `--force` only after deciding replacement is OK.

## Invalid Claude settings JSON

If `~/.claude/settings.json` is invalid JSON, install and uninstall fail safely before writing.

## No Marker Created

Check that Claude Code passed status-line JSON with a current directory and `context_window.used_percentage` at or above the threshold.

## jq Missing

The Claude Code shell scripts use `jq`. Install it with your system package manager.
