#!/usr/bin/env bash
# List recent pi sessions across all projects, sorted by date (newest first).
# Usage: list-sessions.sh [count]
#   count  — number of sessions to show (default: 20)

set -euo pipefail

COUNT="${1:-20}"
SESSIONS_DIR="${HOME}/.pi/agent/sessions"

if [[ ! -d "$SESSIONS_DIR" ]]; then
  echo "No sessions directory found at $SESSIONS_DIR" >&2
  exit 1
fi

# Sort by filename (contains ISO timestamp) regardless of folder
find "$SESSIONS_DIR" -name '*.jsonl' -type f 2>/dev/null \
  | awk -F/ '{print $NF, $0}' \
  | sort -r \
  | cut -d' ' -f2- \
  | head -n "$COUNT" \
  | while IFS= read -r f; do
      folder=$(basename "$(dirname "$f")")
      project=$(echo "$folder" | sed 's/^--//;s/--$//;s/-/\//g')
      fname=$(basename "$f")
      date="${fname%%T*}"
      name=$(grep -m1 '"session_info"' "$f" 2>/dev/null | python3 -c "
import json, sys
try:
    e = json.loads(sys.stdin.readline())
    print(e.get('name', ''))
except: print('')
" 2>/dev/null || echo "")
      printf "%-12s  %-50s  %s\n" "$date" "$project" "$name"
    done
