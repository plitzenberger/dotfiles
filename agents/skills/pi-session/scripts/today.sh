#!/usr/bin/env bash
# List today's sessions, optionally scoped to a project folder.
# Usage: today.sh [project-path]
#   project-path — optional; if omitted, shows today's sessions across all projects
#
# Examples:
#   today.sh                          # all projects
#   today.sh .                        # current directory
#   today.sh ~/Documents/myproject    # specific project

set -euo pipefail

SESSIONS_DIR="${HOME}/.pi/agent/sessions"
TODAY=$(date +%Y-%m-%d)
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

if [[ ! -d "$SESSIONS_DIR" ]]; then
  echo "No sessions directory found at $SESSIONS_DIR" >&2
  exit 1
fi

if [[ $# -ge 1 ]]; then
  # Scope to specific project
  PROJECT_PATH="$(cd "$1" 2>/dev/null && pwd || echo "$1")"
  ENCODED=$(echo "$PROJECT_PATH" | sed 's|^/||;s|/$||;s|/|-|g' | sed 's|^|--|;s|$|--|')
  SEARCH_DIR="$SESSIONS_DIR/$ENCODED"
  if [[ ! -d "$SEARCH_DIR" ]]; then
    echo "No sessions found for project: $PROJECT_PATH" >&2
    exit 1
  fi
else
  SEARCH_DIR="$SESSIONS_DIR"
fi

# Find today's sessions (filenames start with date)
FOUND=$(find "$SEARCH_DIR" -name "${TODAY}T*.jsonl" -type f 2>/dev/null | sort -r)

if [[ -z "$FOUND" ]]; then
  echo "No sessions found for $TODAY"
  [[ $# -ge 1 ]] && echo "  Project: $PROJECT_PATH"
  exit 0
fi

COUNT=$(echo "$FOUND" | wc -l | tr -d ' ')
echo "Found $COUNT session(s) for $TODAY"
[[ $# -ge 1 ]] && echo "  Project: $PROJECT_PATH"
echo ""

echo "$FOUND" | while IFS= read -r f; do
  folder=$(basename "$(dirname "$f")")
  project=$(echo "$folder" | sed 's/^--//;s/--$//;s/-/\//g')
  fname=$(basename "$f")

  # Extract time from filename (HH-mm-ss)
  time_part=$(echo "$fname" | sed "s/^${TODAY}T//;s/-[0-9]*Z_.*//" | sed 's/-/:/g')

  # Get session name
  name=$(grep -m1 '"session_info"' "$f" 2>/dev/null | python3 -c "
import json, sys
try:
    e = json.loads(sys.stdin.readline())
    print(e.get('name', ''))
except: print('')
" 2>/dev/null || echo "")

  # Get message count
  msgs=$(grep -c '"type":"message"' "$f" 2>/dev/null || echo "0")

  # Get session UUID
  uuid=$(head -1 "$f" | python3 -c "
import json, sys
try:
    e = json.loads(sys.stdin.readline())
    print(e.get('id', '')[:8])
except: print('')
" 2>/dev/null || echo "")

  printf "  %s  %s  %3s msgs  %-40s  %s\n" "$time_part" "$uuid" "$msgs" "/$project" "$name"
done
