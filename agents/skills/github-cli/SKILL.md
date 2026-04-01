---
name: github-cli
description: Interact with GitHub using the gh CLI. Use for managing issues, pull requests, repos, releases, gists, Actions workflows, and search. Covers creation, listing, viewing, editing, and status checks across GitHub resources.
compatibility: Requires gh CLI installed and authenticated (gh auth login).
---

# GitHub CLI Skill

Use the `gh` CLI to interact with GitHub. Always prefer structured JSON output (`--json`) when parsing results programmatically.

## Authentication

Verify auth before any operation:

```bash
gh auth status
```

If not authenticated, run `gh auth login` and follow the prompts.

## Issues

```bash
# List open issues
gh issue list

# List with filters
gh issue list --state closed --label "bug" --assignee "@me" --limit 50

# View issue with all details and comments
gh issue view <number> --json title,body,comments,labels,state,assignees,milestone

# Create issue
gh issue create --title "Title" --body "Description" --label "bug,priority:high" --assignee "@me"

# Create issue interactively
gh issue create

# Edit issue
gh issue edit <number> --title "New title" --add-label "bug" --remove-label "wontfix" --add-assignee "user"

# Close / reopen
gh issue close <number> --reason "completed"
gh issue close <number> --reason "not planned"
gh issue reopen <number>

# Comment
gh issue comment <number> --body "Comment text"

# Pin / unpin
gh issue pin <number>
gh issue unpin <number>

# Transfer to another repo
gh issue transfer <number> owner/other-repo

# Lock / unlock
gh issue lock <number> --reason "resolved"
gh issue unlock <number>
```

## Pull Requests

```bash
# List open PRs
gh pr list

# List with filters
gh pr list --state merged --base main --author "@me" --label "feature" --limit 50

# View PR with diff stats and reviews
gh pr view <number>
gh pr view <number> --json title,body,state,reviews,comments,files,additions,deletions,mergeable

# View diff
gh pr diff <number>

# Create PR from current branch
gh pr create --title "Title" --body "Description" --base main --reviewer "user1,user2" --label "feature"

# Create draft PR
gh pr create --title "WIP: Feature" --body "Description" --draft

# Edit PR
gh pr edit <number> --title "New title" --add-label "ready" --add-reviewer "user" --base main

# Review
gh pr review <number> --approve
gh pr review <number> --request-changes --body "Please fix X"
gh pr review <number> --comment --body "Looks good overall"

# Merge
gh pr merge <number> --merge          # merge commit
gh pr merge <number> --squash         # squash and merge
gh pr merge <number> --rebase         # rebase and merge
gh pr merge <number> --auto --squash  # auto-merge when checks pass
gh pr merge <number> --delete-branch  # delete branch after merge

# Mark ready for review (remove draft)
gh pr ready <number>

# Checkout PR locally
gh pr checkout <number>

# Check CI status
gh pr checks <number>

# Close without merging
gh pr close <number>

# Reopen
gh pr reopen <number>

# Comment
gh pr comment <number> --body "Comment text"
```

## Repositories

```bash
# View current repo info
gh repo view
gh repo view --json name,description,url,defaultBranchRef,stargazerCount,forkCount,isPrivate

# View another repo
gh repo view owner/repo

# Create repo
gh repo create my-repo --public --description "Description" --clone
gh repo create my-repo --private --add-readme --license mit --gitignore Node

# Clone
gh repo clone owner/repo
gh repo clone owner/repo -- --depth 1

# Fork
gh repo fork owner/repo --clone

# Edit repo settings
gh repo edit --description "New description" --visibility public --enable-issues --enable-wiki=false

# Delete repo (requires confirmation)
gh repo delete owner/repo --yes

# List your repos
gh repo list --limit 30
gh repo list owner --json name,description,isPrivate,updatedAt

# Rename
gh repo rename new-name

# Archive / unarchive
gh repo archive owner/repo
gh repo unarchive owner/repo

# Add/remove topics
gh repo edit --add-topic "cli,golang" --remove-topic "old-topic"

# Set default repo for commands (in non-repo directories)
gh repo set-default owner/repo
```

## Releases

```bash
# List releases
gh release list --limit 10

# View a release
gh release view v1.0.0

# Create release from tag
gh release create v1.0.0 --title "v1.0.0" --notes "Release notes here"

# Create release with auto-generated notes
gh release create v1.0.0 --generate-notes

# Create draft release
gh release create v1.0.0 --draft --notes "WIP"

# Create pre-release
gh release create v2.0.0-beta.1 --prerelease --notes "Beta release"

# Upload assets to existing release
gh release upload v1.0.0 ./dist/binary-linux ./dist/binary-macos

# Delete release
gh release delete v1.0.0 --yes

# Download release assets
gh release download v1.0.0 --dir ./downloads
gh release download v1.0.0 --pattern "*.tar.gz"

# Edit release
gh release edit v1.0.0 --title "Updated title" --notes "Updated notes" --draft=false
```

## Gists

```bash
# Create gist from file
gh gist create file.txt --public --desc "Description"

# Create gist from stdin
echo "content" | gh gist create --filename "example.txt"

# Create multi-file gist
gh gist create file1.txt file2.txt --desc "Multi-file gist"

# List your gists
gh gist list --limit 20

# View gist
gh gist view <gist-id>

# Edit gist
gh gist edit <gist-id>

# Delete gist
gh gist delete <gist-id>

# Clone gist
gh gist clone <gist-id>
```

## Actions & Workflows

```bash
# List recent workflow runs
gh run list --limit 20

# List runs for a specific workflow
gh run list --workflow build.yml

# View run details
gh run view <run-id>
gh run view <run-id> --json status,conclusion,jobs

# View run logs
gh run view <run-id> --log
gh run view <run-id> --log-failed   # only failed job logs

# Watch a run in progress
gh run watch <run-id>

# Re-run failed jobs
gh run rerun <run-id> --failed

# Re-run entire workflow
gh run rerun <run-id>

# Cancel a run
gh run cancel <run-id>

# List workflows
gh workflow list

# View workflow definition
gh workflow view build.yml

# Run a workflow manually (workflow_dispatch)
gh workflow run build.yml --ref main -f param1=value1

# Enable / disable workflow
gh workflow enable build.yml
gh workflow disable build.yml

# Manage Actions caches
gh cache list
gh cache delete <cache-id>
```

## Search

```bash
# Search repos
gh search repos "query" --language go --stars ">100" --limit 20
gh search repos "topic:cli language:rust" --sort stars

# Search issues
gh search issues "bug" --repo owner/repo --state open --label "critical"

# Search PRs
gh search prs "fix" --repo owner/repo --state merged

# Search code
gh search code "function main" --repo owner/repo --filename "*.go"

# Search commits
gh search commits "fix auth" --repo owner/repo --author "user"
```

## Labels

```bash
# List labels
gh label list

# Create label
gh label create "priority:high" --color FF0000 --description "High priority issues"

# Edit label
gh label edit "bug" --color 00FF00 --new-name "type:bug"

# Delete label
gh label delete "old-label" --yes

# Clone labels from another repo
gh label clone owner/source-repo
```

## GitHub API (Escape Hatch)

For anything not covered by built-in commands:

```bash
# GET request
gh api repos/{owner}/{repo}/contributors --jq '.[].login'

# POST request
gh api repos/{owner}/{repo}/issues -f title="Title" -f body="Body"

# PATCH request
gh api repos/{owner}/{repo}/issues/1 -X PATCH -f state="closed"

# Paginated results
gh api repos/{owner}/{repo}/issues --paginate --jq '.[].title'

# GraphQL query
gh api graphql -f query='
  query {
    repository(owner: "owner", name: "repo") {
      issues(first: 10, states: OPEN) {
        nodes { title number }
      }
    }
  }
'
```

## Status & Notifications

```bash
# Your cross-repo status (assigned issues, review requests, mentions)
gh status
```

## Tips

- Add `--json field1,field2` to most commands for structured output. Pipe through `--jq '.[] | .field'` for extraction.
- Use `-R owner/repo` to target a repo without being in its directory.
- Use `@me` for the authenticated user in assignee/author filters.
- Many create/edit commands accept `--web` to open in the browser instead.
- Use `gh api` as an escape hatch for any GitHub REST or GraphQL endpoint not covered by built-in commands.
