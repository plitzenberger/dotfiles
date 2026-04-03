#!/usr/bin/env bash
# List sessions for a specific project path, sorted by date (newest first).
# Usage: session-by-project.sh <project-path> [count]
#   project-path — absolute or relative path to the project directory
#   count        — number of sessions to show (default: 20)

set -euo pipefail

if [[ $# -lt 1 ]]; then
  echo "Usage: session-by-project.sh <project-path> [count]" >&2
  exit 1
fi

PROJECT_PATH="$(cd "$1" 2>/dev/null && pwd || echo "$1")"
COUNT="${2:-20}"
SESSIONS_DIR="${HOME}/.pi/agent/sessions"

# Encode the project path: strip leading /, replace / with -, wrap in --
ENCODED=$(echo "$PROJECT_PATH" | sed 's|^/||;s|/$||;s|/|-|g' | sed 's|^|--|;s|$|--|')
SESSION_FOLDER="$SESSIONS_DIR/$ENCODED"

if [[ ! -d "$SESSION_FOLDER" ]]; then
  echo "No sessions found for project: $PROJECT_PATH" >&2
  echo "Expected folder: $SESSION_FOLDER" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

ls -1t "$SESSION_FOLDER"/*.jsonl 2>/dev/null \
  | head -n "$COUNT" \
  | while IFS= read -r f; do
      fname=$(basename "$f")
      date="${fname%%T*}"
      # Get name and basic stats
      name=$(grep -m1 '"session_info"' "$f" 2>/dev/null | python3 -c "
import json, sys
try:
    e = json.loads(sys.stdin.readline())
    print(e.get('name', ''))
except: print('')
" 2>/dev/null || echo "")
      msgs=$(grep -c '"type":"message"' "$f" 2>/dev/null || echo "0")
      printf "%-12s  %3s msgs  %s  %s\n" "$date" "$msgs" "$fname" "$name"
    done
