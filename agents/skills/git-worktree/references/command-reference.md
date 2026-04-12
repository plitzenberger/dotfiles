# Git Worktree Command Reference

## `git worktree add`

```
git worktree add [-f] [--detach] [--checkout] [--lock [--reason <string>]]
                 [--orphan] [(-b | -B) <new-branch>] <path> [<commit-ish>]
```

### Behavior

- If `<commit-ish>` omitted and no `-b`/`-B`/`--detach`: creates branch named after `basename <path>`
- If `<commit-ish>` is a branch name not found locally but matches exactly one remote tracking branch, auto-creates local tracking branch
- Bare `-` as `<commit-ish>` means `@{-1}` (previous branch)

### Key Options

| Option | Effect |
|--------|--------|
| `-b <branch>` | Create new branch starting at `<commit-ish>` (default: HEAD) |
| `-B <branch>` | Like `-b` but resets branch if it already exists |
| `-d, --detach` | Detach HEAD in new worktree |
| `--no-checkout` | Skip checkout (useful for sparse-checkout setup) |
| `--orphan` | Create empty worktree with unborn branch |
| `--lock` | Lock worktree immediately after creation |
| `--guess-remote` | Base new branch on matching remote-tracking branch |
| `--relative-paths` | Use relative paths for worktree links |
| `-f, --force` | Override safety checks (branch already checked out, path assigned) |
| `-q, --quiet` | Suppress feedback messages |

## `git worktree list`

```
git worktree list [-v | --porcelain [-z]]
```

- Default: human-readable with path, commit hash, branch name
- `--porcelain`: machine-parseable, stable across versions
- `-z`: NUL-terminated lines (with `--porcelain`)
- `-v`: verbose output with lock reasons

### Scripting with list

```bash
# Get all worktree paths
git worktree list --porcelain | grep "^worktree " | cut -d' ' -f2

# Simple path extraction
git worktree list | awk '{print $1}'
```

## `git worktree remove`

```
git worktree remove [-f] <worktree>
```

- Refuses if worktree has uncommitted/untracked changes (use `--force`)
- Refuses if locked (use `--force --force`)
- Main worktree cannot be removed

## `git worktree move`

```
git worktree move <worktree> <new-path>
```

- Cannot move main worktree or worktrees with submodules
- Use `repair` after manually moving the main worktree

## `git worktree prune`

```
git worktree prune [-n] [-v] [--expire <time>]
```

- `-n, --dry-run`: preview only
- `-v, --verbose`: report all removals
- `--expire <time>`: only prune worktrees older than `<time>`

## `git worktree repair`

```
git worktree repair [<path>...]
```

Fixes broken links after manual directory moves. Run from main worktree with linked worktree paths as arguments.

## `git worktree lock/unlock`

```
git worktree lock [--reason <string>] <worktree>
git worktree unlock <worktree>
```

Prevents pruning/moving/deleting. Use for portable devices or network shares.

## Worktree Identification

Worktrees can be identified by:
- Full absolute path
- Relative path
- Unique final path component (e.g., `ghi` if only one worktree ends with that)

## Configuration

| Config Key | Effect |
|------------|--------|
| `worktree.guessRemote` | Default `--guess-remote` behavior for `add` |
| `worktree.useRelativePaths` | Default to relative paths for links |
| `gc.worktreePruneExpire` | Auto-prune stale worktree metadata during gc |

## Shared vs Per-Worktree Refs

- **Shared**: all `refs/` (branches, tags, remotes)
- **Per-worktree**: `HEAD`, `FETCH_HEAD`, `ORIG_HEAD`, `MERGE_HEAD`, `REBASE_HEAD`, `CHERRY_PICK_HEAD`, `refs/bisect/`, `refs/worktree/`, `refs/rewrite/`
