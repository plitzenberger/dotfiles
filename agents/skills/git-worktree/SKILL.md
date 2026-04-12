---
name: git-worktree
description: |
  Manage git worktrees for parallel development across multiple branches.
  Use when the user asks to: work on multiple branches simultaneously, create a worktree,
  review a PR without switching branches, do a hotfix while mid-feature, run parallel
  AI agents on separate branches, set up isolated workspaces, or avoid git stash.
  Also trigger when the user mentions: worktree, parallel branches, "don't want to stash",
  "work on two branches", context switching between branches, or multi-agent git workflows.
  Do NOT use for regular branch operations (checkout, switch, merge) that don't involve worktrees.
---

# Git Worktree

Manage multiple working trees attached to the same repository. Each worktree checks out a different branch in its own directory, sharing the same `.git` database.

## Core Commands

```bash
# Create worktree for existing branch
git worktree add <path> <branch>

# Create worktree with new branch
git worktree add -b <new-branch> <path> [<commit-ish>]

# Create detached HEAD worktree (throwaway/testing)
git worktree add -d <path> [<commit-ish>]

# List all worktrees
git worktree list

# Remove a worktree (must be clean)
git worktree remove <path>

# Force remove (uncommitted changes)
git worktree remove --force <path>

# Clean stale metadata from manually deleted worktrees
git worktree prune

# Lock/unlock (portable devices, network shares)
git worktree lock [--reason <string>] <worktree>
git worktree unlock <worktree>

# Move worktree to new location
git worktree move <worktree> <new-path>

# Repair broken links after manual moves
git worktree repair [<path>...]
```

## Key Constraints

- **Same branch restriction**: Cannot check out the same branch in two worktrees
- **Shared git database**: All worktrees share refs, remotes, fetch history — `git fetch` in one updates all
- **Independent working dirs**: Each has its own HEAD, index, and working files
- **Linked worktrees** contain a `.git` file (not directory) pointing back to the main repo's `.git/worktrees/`

## Recommended Directory Layout

Place worktrees as siblings to the main repo with descriptive names:

```
~/projects/
  my-project/                    # main worktree (has .git/)
  my-project-feature-auth/       # linked worktree
  my-project-hotfix-login/       # linked worktree
```

## Common Workflows

### Hotfix while mid-feature
```bash
git worktree add ../myproject-hotfix main
cd ../myproject-hotfix
# fix, commit, push
cd ../myproject
git worktree remove ../myproject-hotfix
```

### PR review without context switch
```bash
git worktree add ../myproject-review pr/branch-name
cd ../myproject-review
# review, test, then clean up
cd ../myproject
git worktree remove ../myproject-review
```

### Parallel AI agent development
```bash
git worktree add -b feature-a ../myproject-a
git worktree add -b feature-b ../myproject-b
# Run separate agent sessions in each directory
```

## Cleanup

Always remove worktrees when done. Run `git worktree list` periodically to check for forgotten ones. Each worktree duplicates all working files on disk.

```bash
git worktree list                    # audit
git worktree remove <path>           # clean removal
git worktree prune                   # remove stale metadata
git worktree prune --dry-run         # preview what would be pruned
```

## Pitfalls

- **Forgotten worktrees waste disk** — each is a full file copy
- **Don't nest worktrees** inside other worktrees
- **Submodules** need separate init/update per worktree
- **Build caches** (node_modules, .venv, target/) are duplicated per worktree

## References

- [references/command-reference.md](references/command-reference.md) — Full option details and advanced usage
- [references/workflows.md](references/workflows.md) — Detailed workflow patterns and shell helpers
