# Git Worktree Workflow Patterns

## Shell Helpers

### Aliases

```bash
alias gwl='git worktree list'
alias gwa='git worktree add'
alias gwr='git worktree remove'
alias gwp='git worktree prune'
```

### Quick worktree function

Creates worktree as sibling directory, named `<project>-<branch>`:

```bash
wt() {
  local project="${PWD##*/}"
  git worktree add "../${project}-$1" -b "$1"
  cd "../${project}-$1"
}
```

### With dependency setup

```bash
# Node.js
wt-node() {
  wt "$1" && npm install
}

# Python
wt-python() {
  wt "$1" && python -m venv .venv && source .venv/bin/activate && pip install -r requirements.txt
}

# Nix
wt-nix() {
  local project="${PWD##*/}"
  git worktree add "../${project}-$1" -b "$1"
  cd "../${project}-$1"
  # direnv will auto-activate if .envrc exists
}
```

## Workflow: Hotfix While Mid-Feature

```bash
# You're in ~/projects/myapp working on feature-x
git worktree add ../myapp-hotfix main
cd ../myapp-hotfix

# Make the fix
git add -A && git commit -m "fix: critical bug"
git push origin main

# Clean up and return
cd ../myapp
git worktree remove ../myapp-hotfix
```

## Workflow: PR Code Review

```bash
# Fetch the PR branch
git fetch origin pull/123/head:pr-123

# Create review worktree
git worktree add ../myapp-review pr-123
cd ../myapp-review

# Run tests, inspect code
npm test  # or equivalent

# Done reviewing
cd ../myapp
git worktree remove ../myapp-review
git branch -D pr-123  # clean up local branch
```

## Workflow: Parallel AI Agent Development

Run multiple AI coding agents on independent features simultaneously:

```bash
# Create isolated worktrees
git worktree add -b feature-auth ../myapp-auth
git worktree add -b feature-search ../myapp-search
git worktree add -b feature-dashboard ../myapp-dashboard

# Each agent works in its own directory
# Terminal 1: cd ../myapp-auth && claude
# Terminal 2: cd ../myapp-search && claude
# Terminal 3: cd ../myapp-dashboard && claude

# After completion, merge and clean up
cd ~/projects/myapp
git merge feature-auth
git worktree remove ../myapp-auth

git merge feature-search
git worktree remove ../myapp-search

git merge feature-dashboard
git worktree remove ../myapp-dashboard
```

### Best practices for parallel AI agents

- Use for **independent** features (no overlapping files)
- Each worktree needs its own dependency install (node_modules, .venv)
- Monitor disk usage — each worktree duplicates working files
- Merge one at a time to handle conflicts sequentially
- Large features (30+ min) benefit most from parallelization

## Workflow: Compare Two Versions Side-by-Side

```bash
git worktree add -d ../myapp-v1 v1.0.0
git worktree add -d ../myapp-v2 v2.0.0

# Diff, benchmark, or test both versions
diff ../myapp-v1/src ../myapp-v2/src

# Clean up
git worktree remove ../myapp-v1
git worktree remove ../myapp-v2
```

## Workflow: CI/CD Build Multiple Branches

Instead of multiple clones, use one clone with worktrees:

```bash
git worktree add ./build-main main
git worktree add ./build-staging staging
git worktree add ./build-release release/v2

# Build each in parallel
(cd build-main && make) &
(cd build-staging && make) &
(cd build-release && make) &
wait
```

## Maintenance Routine

Run periodically to keep worktrees tidy:

```bash
# List all worktrees
git worktree list

# Preview stale cleanup
git worktree prune --dry-run

# Actually clean up
git worktree prune

# Remove specific finished worktrees
git worktree remove ../myapp-old-feature
```

## Tips

- **Don't stash** — create a worktree instead. Stashes are easy to forget.
- **Name descriptively** — `myapp-feature-auth` not `myapp-temp2`
- **Remove promptly** — disk space adds up fast with large repos
- **Fetch once, use everywhere** — `git fetch` in any worktree updates all
- **Editor support** — open each worktree as a separate project/window
- **gitignore build artifacts** — each worktree generates its own
