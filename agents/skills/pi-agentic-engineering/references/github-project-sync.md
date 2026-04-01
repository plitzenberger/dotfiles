# GitHub Project Board Sync for Agent Teams

Mirror pi-teams task boards to a GitHub Project (V2) so humans can track agent work from a kanban view, comment on tasks, and intervene without touching tmux.

## Prerequisites

1. **`gh` CLI** authenticated with project scope:
   ```bash
   gh auth refresh -s project
   ```
2. **A GitHub repo** in the current directory (or specify with `-R owner/repo`)
3. **pi-teams** running with a team

## Setup Workflow

### 1. Create the Project Board

```bash
# For an org repo
OWNER=$(gh repo view --json owner -q '.owner.login')
PROJECT_NUM=$(gh project create --owner "$OWNER" --title "Agent Team: <team-name>" --format json | jq -r '.number')

# For personal repos
PROJECT_NUM=$(gh project create --owner "@me" --title "Agent Team: <team-name>" --format json | jq -r '.number')
```

### 2. Link to Repo

```bash
REPO_URL=$(gh repo view --json url -q '.url')
gh project link "$PROJECT_NUM" --owner "$OWNER" --repo "$REPO_URL"
```

### 3. Create Agent Labels

```bash
gh label create "agent:team-lead" --color 6f42c1 --description "Task managed by team lead" 2>/dev/null
gh label create "agent:frontend" --color 0075ca --description "Frontend agent" 2>/dev/null
gh label create "agent:backend" --color e3b341 --description "Backend agent" 2>/dev/null
gh label create "agent:integrator" --color d73a4a --description "Integration agent" 2>/dev/null
# Add one per teammate
```

### 4. Get Project Field IDs (needed for status updates)

```bash
gh project field-list "$PROJECT_NUM" --owner "$OWNER" --format json
```

Save the `Status` field ID and its option IDs (Todo, In Progress, Done).

---

## Task Lifecycle Mapping

| pi-teams action | GitHub equivalent | Command |
|-----------------|-------------------|---------|
| `task_create` | Create issue + add to project | See [Create Task](#create-task) |
| `task_update` status → `in_progress` | Move to "In Progress" column | See [Update Status](#update-status) |
| `task_update` status → `completed` | Move to "Done" + close issue | See [Complete Task](#complete-task) |
| `send_message` (progress) | Issue comment | See [Agent Comment](#agent-comment) |
| `task_submit_plan` | Issue comment with plan | See [Submit Plan](#submit-plan) |
| `task_evaluate_plan` approve | Issue comment + label | See [Approve Plan](#approve-plan) |

---

## Commands

### Create Task

After calling `task_create`, mirror to GitHub:

```bash
# Create the issue
ISSUE_URL=$(gh issue create \
  --title "[Agent Task] <subject>" \
  --body "<description>

---
**Agent Team:** <team-name>
**Assigned to:** <agent-name>
**Pi Task ID:** <task-id>
" \
  --label "agent:<agent-name>" \
  --json url -q '.url')

# Add to project board
gh project item-add "$PROJECT_NUM" --owner "$OWNER" --url "$ISSUE_URL"
```

### Update Status

```bash
# Get the item ID from the project
ITEM_ID=$(gh project item-list "$PROJECT_NUM" --owner "$OWNER" --format json \
  | jq -r '.items[] | select(.content.url == "'"$ISSUE_URL"'") | .id')

# Move to "In Progress" (use the option ID from field-list)
gh project item-edit \
  --id "$ITEM_ID" \
  --project-id "$PROJECT_ID" \
  --field-id "$STATUS_FIELD_ID" \
  --single-select-option-id "$IN_PROGRESS_OPTION_ID"
```

### Complete Task

```bash
# Move to "Done" on the board
gh project item-edit \
  --id "$ITEM_ID" \
  --project-id "$PROJECT_ID" \
  --field-id "$STATUS_FIELD_ID" \
  --single-select-option-id "$DONE_OPTION_ID"

# Close the issue
gh issue close "$ISSUE_NUMBER" --reason completed
```

### Agent Comment

When agents send progress messages, mirror as issue comments:

```bash
gh issue comment "$ISSUE_NUMBER" --body "🤖 **[$AGENT_NAME]** $MESSAGE"
```

### Submit Plan

```bash
gh issue comment "$ISSUE_NUMBER" --body "📋 **[$AGENT_NAME] Plan Submitted**

$PLAN_TEXT

---
*Awaiting approval from team lead.*"
```

### Approve Plan

```bash
gh issue comment "$ISSUE_NUMBER" --body "✅ **[team-lead] Plan Approved**"
gh issue edit "$ISSUE_NUMBER" --add-label "plan:approved"
```

For rejection:

```bash
gh issue comment "$ISSUE_NUMBER" --body "❌ **[team-lead] Plan Rejected**

$FEEDBACK"
gh issue edit "$ISSUE_NUMBER" --add-label "plan:needs-revision"
```

---

## Helper Script

Use [scripts/gh-project-sync.sh](scripts/gh-project-sync.sh) to automate the setup and provide simple wrapper commands:

```bash
# Initialize a project board for a team
source scripts/gh-project-sync.sh
ghsync_init "my-team"

# Then use wrapper functions
ghsync_create_task "my-team" "Build auth API" "Create the /api/auth endpoint" "backend"
ghsync_update_status "$ISSUE_NUMBER" "in_progress"
ghsync_comment "$ISSUE_NUMBER" "backend" "Started implementing the endpoint"
ghsync_complete "$ISSUE_NUMBER"
```

---

## Team Lead Instructions

When using GitHub Project sync, the team lead should:

1. **Run `ghsync_init` once** at team creation to set up the board
2. **After each `task_create`**, call `ghsync_create_task` to mirror it
3. **Instruct teammates** to call `ghsync_comment` when they send progress messages
4. **After `task_update` status changes**, call the matching `ghsync_update_status` or `ghsync_complete`
5. **Share the project URL** — `gh project view $PROJECT_NUM --owner $OWNER --web`

## Agent Teammate Instructions

When running as a teammate with GitHub sync enabled:

1. After updating a task to `in_progress`: `ghsync_update_status $ISSUE in_progress`
2. When sending progress to lead: also `ghsync_comment $ISSUE "$AGENT" "$MSG"`
3. When submitting a plan: also `ghsync_plan $ISSUE "$AGENT" "$PLAN"`
4. After completing a task: `ghsync_complete $ISSUE`

---

## Limitations

- **Auth scope:** Requires `gh auth refresh -s project` (one-time)
- **Rate limits:** GitHub API allows ~5000 requests/hour; typical agent teams use <50
- **Draft issues vs real issues:** `gh project item-create` makes drafts (no repo link); prefer `gh issue create` + `gh project item-add` for full traceability
- **No webhook sync:** This is push-only. Human edits on the board don't propagate back to pi-teams. (That requires Option B — a bidirectional extension.)
- **Field IDs are project-specific:** Must query `field-list` once per project to get Status field/option IDs
