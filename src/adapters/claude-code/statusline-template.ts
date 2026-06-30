export function statuslineScriptTemplate(): string {
  return `#!/usr/bin/env bash
set -u

input="$(cat)"
parsed="$(INPUT_JSON="$input" node -e '
try {
  const data = JSON.parse(process.env.INPUT_JSON || "{}");
  const cwd = data?.workspace?.current_dir || data?.cwd || data?.current_dir || "";
  const used = data?.context_window?.used_percentage ?? data?.context?.used_percentage ?? 0;
  process.stdout.write(String(cwd).replace(/\\n/g, " ") + "\\n" + String(used));
} catch {
  process.stdout.write("\\n0");
}
' 2>/dev/null || printf '\\n0')"
cwd="$(printf '%s' "$parsed" | sed -n '1p')"
used="$(printf '%s' "$parsed" | sed -n '2p')"
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
