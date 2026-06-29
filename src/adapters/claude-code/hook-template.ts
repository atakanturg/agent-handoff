export function hookScriptTemplate(): string {
  return `#!/usr/bin/env bash
set -u

input="$(cat)"
cwd="$(printf '%s' "$input" | jq -r '.workspace.current_dir // .cwd // .current_dir // empty' 2>/dev/null)"
mode="\${AGENT_HANDOFF_MODE:-marker}"

if [ -z "$cwd" ] || [ ! -e "$cwd/.handoff-needed" ]; then
  exit 0
fi

case "$mode" in
  marker)
    exit 0
    ;;
  warn)
    printf '%s\\n' "agent-handoff: .handoff-needed exists. Create/update handoff.md, remove the marker, then tell the user handoff is ready." >&2
    exit 0
    ;;
  block)
    printf '%s\\n' "agent-handoff: handoff required. Stop normal work, create/update handoff.md using the universal schema, remove .handoff-needed, and tell the user handoff is ready." >&2
    exit 2
    ;;
  *)
    printf '%s\\n' "agent-handoff: unknown AGENT_HANDOFF_MODE '$mode'; allowing continuation." >&2
    exit 0
    ;;
esac
`;
}
