#!/usr/bin/env bash
# gh-project-sync.sh — Source this file to get GitHub Project sync helpers for pi-teams.
#
# Usage:
#   source /path/to/gh-project-sync.sh
#   ghsync_init "my-team"                     # Create project board + labels
#   ghsync_create_task "my-team" "Title" "Body" "agent-name"
#   ghsync_update_status <issue-number> "in_progress|done"
#   ghsync_comment <issue-number> "agent-name" "message"
#   ghsync_plan <issue-number> "agent-name" "plan text"
#   ghsync_approve <issue-number>
#   ghsync_reject <issue-number> "feedback"
#   ghsync_complete <issue-number>
#   ghsync_board                               # Open board in browser
#
# Prerequisites:
#   gh auth refresh -s project

set -euo pipefail

# State file for the current session
GHSYNC_STATE_FILE="${TMPDIR:-/tmp}/ghsync-state-$$.env"

# ─── Init ───────────────────────────────────────────────────────────────────────

ghsync_init() {
  local team_name="${1:?Usage: ghsync_init <team-name> [owner]}"
  local owner="${2:-}"

  # Resolve owner from repo if not provided
  if [[ -z "$owner" ]]; then
    owner=$(gh repo view --json owner -q '.owner.login' 2>/dev/null || echo "")
    if [[ -z "$owner" ]]; then
      echo "ERROR: Not in a git repo and no owner specified." >&2
      return 1
    fi
  fi

  # Check auth scope
  if ! gh project list --owner "$owner" --limit 1 &>/dev/null; then
    echo "Missing project scope. Run: gh auth refresh -s project" >&2
    return 1
  fi

  # Create project
  echo "Creating GitHub Project for team '$team_name'..."
  local project_json
  project_json=$(gh project create --owner "$owner" --title "Agent Team: $team_name" --format json)
  local project_num
  project_num=$(echo "$project_json" | jq -r '.number')

  # Get project ID and status field details
  local fields_json
  fields_json=$(gh project field-list "$project_num" --owner "$owner" --format json)

  local project_id
  project_id=$(echo "$fields_json" | jq -r '.fields[] | select(.name == "Status") | .id' | head -1)
  # project_id from field-list isn't the project node ID; get it from the project itself
  project_id=$(gh api graphql -f query="
    query {
      $(if [[ "$owner" == "@me" ]]; then echo "viewer { projectV2(number: $project_num) { id } }"; else echo "organization(login: \"$owner\") { projectV2(number: $project_num) { id } }"; fi)
    }
  " --jq '.data | .. | .id? // empty' 2>/dev/null | head -1)

  local status_field_id
  status_field_id=$(echo "$fields_json" | jq -r '.fields[] | select(.name == "Status") | .id')

  # Get status option IDs
  local status_options
  status_options=$(echo "$fields_json" | jq -r '.fields[] | select(.name == "Status") | .options')

  local todo_id inprogress_id done_id
  todo_id=$(echo "$status_options" | jq -r '.[] | select(.name == "Todo") | .id')
  inprogress_id=$(echo "$status_options" | jq -r '.[] | select(.name == "In Progress") | .id')
  done_id=$(echo "$status_options" | jq -r '.[] | select(.name == "Done") | .id')

  # Link to repo (if in a repo)
  local repo_name
  repo_name=$(gh repo view --json nameWithOwner -q '.nameWithOwner' 2>/dev/null || echo "")
  if [[ -n "$repo_name" ]]; then
    gh project link "$project_num" --owner "$owner" --repo "$repo_name" 2>/dev/null || true
  fi

  # Save state
  cat > "$GHSYNC_STATE_FILE" <<EOF
GHSYNC_OWNER="$owner"
GHSYNC_PROJECT_NUM="$project_num"
GHSYNC_PROJECT_ID="$project_id"
GHSYNC_STATUS_FIELD_ID="$status_field_id"
GHSYNC_TODO_ID="$todo_id"
GHSYNC_INPROGRESS_ID="$inprogress_id"
GHSYNC_DONE_ID="$done_id"
GHSYNC_TEAM="$team_name"
GHSYNC_REPO="$repo_name"
EOF

  echo "✅ Project board created: #$project_num"
  echo "   Owner: $owner"
  echo "   State: $GHSYNC_STATE_FILE"
  echo ""
  echo "Open in browser: gh project view $project_num --owner $owner --web"
}

_ghsync_load() {
  if [[ ! -f "$GHSYNC_STATE_FILE" ]]; then
    echo "ERROR: No ghsync session. Run ghsync_init first." >&2
    return 1
  fi
  # shellcheck disable=SC1090
  source "$GHSYNC_STATE_FILE"
}

# ─── Create Task ────────────────────────────────────────────────────────────────

ghsync_create_task() {
  _ghsync_load || return 1
  local team="${1:?Usage: ghsync_create_task <team> <title> <body> [agent]}"
  local title="${2:?}"
  local body="${3:?}"
  local agent="${4:-unassigned}"

  # Ensure agent label exists
  gh label create "agent:$agent" --color 0075ca --description "Agent: $agent" 2>/dev/null || true

  # Create issue
  local issue_url
  issue_url=$(gh issue create \
    --title "[🤖 $agent] $title" \
    --body "$body

---
**Agent Team:** $team
**Assigned to:** $agent
**Synced from pi-teams**" \
    --label "agent:$agent" \
    --json url -q '.url')

  local issue_number
  issue_number=$(basename "$issue_url")

  # Add to project
  gh project item-add "$GHSYNC_PROJECT_NUM" --owner "$GHSYNC_OWNER" --url "$issue_url" >/dev/null

  echo "$issue_number"
}

# ─── Update Status ──────────────────────────────────────────────────────────────

ghsync_update_status() {
  _ghsync_load || return 1
  local issue_number="${1:?Usage: ghsync_update_status <issue-number> <status>}"
  local status="${2:?Status: todo|in_progress|done}"

  local option_id
  case "$status" in
    todo)        option_id="$GHSYNC_TODO_ID" ;;
    in_progress) option_id="$GHSYNC_INPROGRESS_ID" ;;
    done)        option_id="$GHSYNC_DONE_ID" ;;
    *) echo "Unknown status: $status" >&2; return 1 ;;
  esac

  # Get issue URL and find project item ID
  local issue_url
  issue_url=$(gh issue view "$issue_number" --json url -q '.url')

  local item_id
  item_id=$(gh project item-list "$GHSYNC_PROJECT_NUM" --owner "$GHSYNC_OWNER" --format json --limit 100 \
    | jq -r '.items[] | select(.content.url == "'"$issue_url"'") | .id')

  if [[ -n "$item_id" ]]; then
    gh project item-edit \
      --id "$item_id" \
      --project-id "$GHSYNC_PROJECT_ID" \
      --field-id "$GHSYNC_STATUS_FIELD_ID" \
      --single-select-option-id "$option_id" >/dev/null
  fi
}

# ─── Comment ────────────────────────────────────────────────────────────────────

ghsync_comment() {
  local issue_number="${1:?Usage: ghsync_comment <issue-number> <agent> <message>}"
  local agent="${2:?}"
  local message="${3:?}"

  gh issue comment "$issue_number" --body "🤖 **[$agent]** $message"
}

# ─── Plan Submission ────────────────────────────────────────────────────────────

ghsync_plan() {
  local issue_number="${1:?Usage: ghsync_plan <issue-number> <agent> <plan-text>}"
  local agent="${2:?}"
  local plan="${3:?}"

  gh issue comment "$issue_number" --body "📋 **[$agent] Plan Submitted**

$plan

---
*Awaiting approval from team lead.*"

  gh issue edit "$issue_number" --add-label "plan:submitted" 2>/dev/null || true
}

ghsync_approve() {
  local issue_number="${1:?Usage: ghsync_approve <issue-number>}"
  gh issue comment "$issue_number" --body "✅ **[team-lead] Plan Approved**"
  gh issue edit "$issue_number" --add-label "plan:approved" --remove-label "plan:submitted" 2>/dev/null || true
}

ghsync_reject() {
  local issue_number="${1:?Usage: ghsync_reject <issue-number> <feedback>}"
  local feedback="${2:?}"
  gh issue comment "$issue_number" --body "❌ **[team-lead] Plan Rejected**

$feedback"
  gh issue edit "$issue_number" --add-label "plan:needs-revision" --remove-label "plan:submitted" 2>/dev/null || true
}

# ─── Complete ───────────────────────────────────────────────────────────────────

ghsync_complete() {
  _ghsync_load || return 1
  local issue_number="${1:?Usage: ghsync_complete <issue-number>}"

  ghsync_update_status "$issue_number" "done"
  gh issue close "$issue_number" --reason completed
}

# ─── Board ──────────────────────────────────────────────────────────────────────

ghsync_board() {
  _ghsync_load || return 1
  gh project view "$GHSYNC_PROJECT_NUM" --owner "$GHSYNC_OWNER" --web
}

echo "gh-project-sync loaded. Run ghsync_init <team-name> to start."
