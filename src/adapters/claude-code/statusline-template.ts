export function statuslineScriptTemplate(): string {
  return `#!/usr/bin/env bash
set -u

input="$(cat)"
cwd="$(printf '%s' "$input" | jq -r '.workspace.current_dir // .cwd // .current_dir // empty' 2>/dev/null)"
used="$(printf '%s' "$input" | jq -r '.context_window.used_percentage // 0' 2>/dev/null)"
threshold="\${AGENT_HANDOFF_THRESHOLD:-90}"

if [ -z "$used" ] || [ "$used" = "null" ]; then
  used="0"
fi

needed="ok"
if [ -n "$cwd" ] && awk "BEGIN { exit !($used >= $threshold) }"; then
  mkdir -p "$cwd/.agent-handoff"
  if [ ! -e "$cwd/.handoff-needed" ]; then
    printf '%s\\n' "Create or update handoff.md before continuing normal work." > "$cwd/.handoff-needed"
  fi
  now="$(date -u +"%Y-%m-%dT%H:%M:%SZ")"
  cat > "$cwd/.agent-handoff/state.json" <<JSON
{
  "version": 1,
  "needed": true,
  "reason": "Claude Code context usage reached threshold",
  "triggeredBy": "claude-code-statusline",
  "createdAt": "$now",
  "updatedAt": "$now",
  "cwd": "$cwd",
  "threshold": $threshold,
  "usedPercentage": $used,
  "mode": "\${AGENT_HANDOFF_MODE:-marker}"
}
JSON
  needed="needed"
fi

printf 'ctx:%s%% handoff:%s\\n' "$used" "$needed"
`;
}
