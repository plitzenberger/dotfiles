---
name: branch-protection
description: >
  Configure branch protection rulesets at repo or org level using the GitHub API.
  Covers merge method restrictions, required reviews, admin bypass, strict branch
  up-to-date enforcement, and org-wide repo settings. Use when asked to set up
  branch protection, rulesets, merge requirements, update policies, or org-level
  security settings. Also trigger for: "only allow merge commits", "require
  branches to be up-to-date", "no force push", "require reviews", "protect main".
  Do NOT use for GitHub Actions workflow authoring, CI/CD setup, or general
  repo configuration unrelated to branch protection.
compatibility: Requires gh CLI installed and authenticated with admin:org and repo scopes.
---

# Branch Protection Skill

Configure branch protection rulesets on GitHub repositories or across an entire organization.

## Scope Decision

Determine scope FIRST — this changes the API endpoints and workflow:

| Scope | When | API base |
|-------|------|----------|
| **Single repo** | User names a specific repo | `repos/{owner}/{repo}/rulesets` |
| **Organization-wide** | User says "org-wide", "all repos", or names an org | `orgs/{org}/rulesets` |

**⚠️ Org vs repo — what goes where:**

| Rule type | Org-level OK? | Why |
|-----------|---------------|-----|
| `deletion`, `non_fast_forward` | ✅ Yes | Universal — applies to all repos equally |
| `pull_request` (reviews, merge methods) | ✅ Yes | Universal policy |
| `required_status_checks` | ❌ **NEVER** | Different repos have different CI pipelines. Always create repo-level rulesets for status checks. |

<!-- Status checks in org rulesets block PRs on repos that don't have those CI jobs. This has caused production incidents. NEVER put required_status_checks in an org-level ruleset. -->

## Standard Configuration

The standard ruleset enforces:

- **1 required approving review** before merge
- **Dismiss stale reviews** on new pushes
- **Required review thread resolution** (all conversations must be resolved)
- **No last-push approval required** (the pusher can also approve)
- **No code owner review required**
- **Merge commit only** (no squash or rebase) — set in BOTH the ruleset `allowed_merge_methods` AND repo-level settings
- **No deletion** of the default branch
- **No non-fast-forward** pushes (no force push)
- **Admin bypass via checkbox** (admins see a "bypass" checkbox on PRs)
- **Update branch button enabled** with rebase (shows "Update branch" when PR is behind)

---

## Workflow

### Step 1: Identify target and inventory CI

```bash
# Current repo:
gh repo view --json nameWithOwner -q .nameWithOwner

# Org — list all repos:
gh repo list {org} --json nameWithOwner,name --limit 100 -q '.[] | .nameWithOwner'
```

**Before creating any ruleset, inventory existing CI checks per repo:**

```bash
# List workflows and check names for each repo
for repo in $(gh repo list {org} --json nameWithOwner --limit 100 -q '.[] | .nameWithOwner'); do
  echo "=== $repo ==="
  gh api repos/$repo/actions/workflows --jq '.workflows[] | {name, path}' 2>/dev/null
  # Get actual job names from recent runs
  RUN_ID=$(gh api repos/$repo/actions/runs --jq '.workflow_runs[0].id' 2>/dev/null)
  if [ -n "$RUN_ID" ] && [ "$RUN_ID" != "null" ]; then
    gh api repos/$repo/actions/runs/$RUN_ID/jobs --jq '.jobs[] | .name' 2>/dev/null
  else
    echo "(no workflow runs)"
  fi
done
```

This inventory determines which repos need `required_status_checks` and with which check names. Do NOT skip this step.

### Step 2: Check existing rulesets

```bash
# Repo-level:
gh api repos/{owner}/{repo}/rulesets --jq '.[] | {id, name, enforcement}'

# Org-level:
gh api orgs/{org}/rulesets --jq '.[] | {id, name, enforcement}'
```

If a ruleset already exists for the default branch, UPDATE it — do NOT create a duplicate.

**If an existing org-level ruleset contains `required_status_checks`, remove that rule and migrate it to repo-level rulesets.** This is always a misconfiguration.

### Step 3: Create or update the org-level ruleset

The org-level ruleset contains ONLY universal rules — no status checks.

```bash
gh api orgs/{org}/rulesets -X POST --input <(cat <<'EOF'
{
  "name": "main-protection",
  "enforcement": "active",
  "target": "branch",
  "bypass_actors": [
    { "actor_id": 5, "actor_type": "RepositoryRole", "bypass_mode": "pull_request" }
  ],
  "conditions": {
    "ref_name": { "include": ["refs/heads/main"], "exclude": [] },
    "repository_name": { "include": ["~ALL"], "exclude": [] }
  },
  "rules": [
    { "type": "deletion" },
    { "type": "non_fast_forward" },
    {
      "type": "pull_request",
      "parameters": {
        "required_approving_review_count": 1,
        "dismiss_stale_reviews_on_push": true,
        "required_reviewers": [],
        "require_code_owner_review": false,
        "require_last_push_approval": false,
        "required_review_thread_resolution": true,
        "allowed_merge_methods": ["merge"]
      }
    }
  ]
}
EOF
)

# UPDATE — same payload but PUT with ruleset ID:
gh api orgs/{org}/rulesets/{ruleset_id} -X PUT --input <(cat <<'EOF'
...same JSON...
EOF
)
```

**Key org-level details:**
- Endpoint: `orgs/{org}/rulesets`
- Must include `repository_name` condition (`~ALL` for all repos, or list specific names)
- Branch ref uses `refs/heads/main` (NOT `~DEFAULT_BRANCH` — that syntax only works for repo-level)
- Same ruleset ID appears on all matched repos
- **Do NOT include `required_status_checks` here**

### Step 4: Create repo-level rulesets for status checks

For each repo that has CI workflows, create a **repo-level** ruleset with that repo's specific check names. Only include checks that actually exist as workflow jobs.

```bash
# Example: repo with lint + test jobs
gh api repos/{owner}/{repo}/rulesets -X POST --input <(cat <<'EOF'
{
  "name": "ci-checks",
  "enforcement": "active",
  "target": "branch",
  "conditions": {
    "ref_name": { "include": ["~DEFAULT_BRANCH"], "exclude": [] }
  },
  "rules": [
    {
      "type": "required_status_checks",
      "parameters": {
        "strict_required_status_checks_policy": true,
        "required_status_checks": [
          { "context": "lint" },
          { "context": "test" }
        ]
      }
    }
  ]
}
EOF
)
```

Replace the check names with the actual job names from Step 1's inventory. Each repo gets its own ruleset with its own checks.

**For repos with NO CI workflows:** Do not create a `ci-checks` ruleset. If up-to-date enforcement is desired without CI, create a lightweight pass-through workflow first:

```yaml
# .github/workflows/branch-check.yml
name: Branch Check
on:
  pull_request:
    branches: [main]

jobs:
  branch-check:
    runs-on: ubuntu-latest
    steps:
      - name: Pass
        run: echo "Branch is up to date"
```

Then reference `{ "context": "branch-check" }` in that repo's `ci-checks` ruleset.

> **Note:** The GitHub contents API may return 404 on private repos with OAuth tokens. Use `git clone` + `git push` to add workflow files. If branch protection is already active, temporarily set the ruleset to `"enforcement": "evaluate"` before pushing, then re-enable.

### Step 5: Configure repo-level merge and update settings

These settings are per-repo and CANNOT be set at the org level via rulesets:

```bash
# Single repo:
gh api repos/{owner}/{repo} -X PATCH \
  -f allow_merge_commit=true \
  -f allow_rebase_merge=false \
  -f allow_squash_merge=false \
  -f allow_update_branch=true

# Org-wide — loop all repos:
for repo in $(gh repo list {org} --json nameWithOwner --limit 100 -q '.[] | .nameWithOwner'); do
  echo "=== Configuring $repo ==="
  gh api repos/$repo -X PATCH \
    -f allow_merge_commit=true \
    -f allow_rebase_merge=false \
    -f allow_squash_merge=false \
    -f allow_update_branch=true \
    --jq '{allow_merge_commit, allow_rebase_merge, allow_squash_merge, allow_update_branch}'
done
```

<!-- Both the ruleset allowed_merge_methods AND the repo settings must agree. The ruleset enforces it on the branch protection side; the repo settings control the GitHub UI dropdown. Set both. -->

### Step 6: Verify

**6a. Verify rulesets:**

```bash
# Org-level ruleset — confirm NO required_status_checks:
gh api orgs/{org}/rulesets/{ruleset_id} \
  | jq '{name, enforcement, rules: [.rules[] | .type]}'

# Repo-level rulesets — confirm checks match actual CI jobs:
gh api repos/{owner}/{repo}/rulesets --jq '.[] | {id, name}'
gh api repos/{owner}/{repo}/rulesets/{ruleset_id} \
  | jq '{name, enforcement, rules: [.rules[] | {type, parameters}]}'
```

**6b. Cross-check: required checks exist as actual CI jobs:**

For every repo with a `ci-checks` ruleset, verify each required check context matches an actual workflow job name:

```bash
for repo in $(gh repo list {org} --json nameWithOwner --limit 100 -q '.[] | .nameWithOwner'); do
  echo "=== $repo ==="

  # Get required check contexts from repo-level rulesets
  REQUIRED=$(gh api repos/$repo/rulesets --jq '
    [.[] | select(.rules != null) | .rules[] |
     select(.type == "required_status_checks") |
     .parameters.required_status_checks[].context] | unique | .[]' 2>/dev/null)

  if [ -z "$REQUIRED" ]; then
    echo "  No required status checks — OK"
    continue
  fi

  # Get actual job names from most recent workflow run
  RUN_ID=$(gh api repos/$repo/actions/runs --jq '.workflow_runs[0].id' 2>/dev/null)
  if [ -z "$RUN_ID" ] || [ "$RUN_ID" = "null" ]; then
    echo "  ⚠️  Has required checks but NO workflow runs: $REQUIRED"
    continue
  fi

  ACTUAL=$(gh api repos/$repo/actions/runs/$RUN_ID/jobs --jq '.jobs[].name' 2>/dev/null)

  for check in $REQUIRED; do
    if echo "$ACTUAL" | grep -qx "$check"; then
      echo "  ✅ $check — found"
    else
      echo "  ❌ $check — MISSING (will block PRs!)"
    fi
  done
done
```

**6c. Verify repo merge settings:**

```bash
gh api repos/{owner}/{repo} \
  --jq '{allow_merge_commit, allow_rebase_merge, allow_squash_merge, allow_update_branch}'
```

---

## Rules

- **NEVER put `required_status_checks` in an org-level ruleset.** Different repos have different CI pipelines. Status checks are always repo-level. This is the single most important rule in this skill.
- **Always inventory CI checks (Step 1) before creating rulesets.** Do not assume what checks a repo has.
- **Always cross-check (Step 6b) after setup.** Verify every required check context corresponds to an actual workflow job.
- **Always check for existing rulesets first** — update, never duplicate.
- **Set merge methods in BOTH places** — ruleset `allowed_merge_methods` AND repo-level `allow_*_merge` settings. They serve different purposes (branch enforcement vs UI controls).
- **Org rulesets use `refs/heads/main`**, not `~DEFAULT_BRANCH`. The `~DEFAULT_BRANCH` shorthand only works for repo-level rulesets.
- **`required_status_checks` needs ≥1 check** — an empty array causes HTTP 422. Create a pass-through workflow if no CI exists.
- **Contents API returns 404 on private repos** with OAuth tokens — use `git clone` + `git push` to add workflow files.
- **Disable enforcement before pushing to protected branches** — set `"enforcement": "evaluate"` or `"enforcement": "disabled"` temporarily, then re-enable.
- **Repo-level settings cannot be set org-wide via API** — you must loop over all repos for `allow_merge_commit`, `allow_squash_merge`, `allow_rebase_merge`, and `allow_update_branch`.

---

## Bypass Actor Reference

| actor_id | actor_type | Description |
|----------|------------|-------------|
| 1 | RepositoryRole | Read |
| 2 | RepositoryRole | Triage |
| 3 | RepositoryRole | Write |
| 4 | RepositoryRole | Maintain |
| 5 | RepositoryRole | Admin |

- `bypass_mode: "always"` — bypasses automatically, no checkbox
- `bypass_mode: "pull_request"` — shows a checkbox on PRs to opt-in to bypass

### Adding specific users or teams

```bash
# Get user ID:
gh api users/{username} --jq '.id'

# Get team ID:
gh api orgs/{org}/teams/{team_slug} --jq '.id'
```

```json
{"actor_id": 12345, "actor_type": "User", "bypass_mode": "pull_request"}
{"actor_id": 67890, "actor_type": "Team", "bypass_mode": "pull_request"}
```

---

## Org-Level Repository Name Conditions

Control which repos an org ruleset applies to:

```json
// All repos:
"repository_name": { "include": ["~ALL"], "exclude": [] }

// Specific repos only:
"repository_name": { "include": ["my-app", "my-api"], "exclude": [] }

// All except some:
"repository_name": { "include": ["~ALL"], "exclude": ["sandbox-*"] }
```
