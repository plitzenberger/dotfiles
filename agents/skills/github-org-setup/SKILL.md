---
name: github-org-setup
description: Configure GitHub organization settings including default permissions, member privileges, security policies, and repository defaults. Use when asked to set up, audit, or harden a GitHub organization.
compatibility: Requires gh CLI installed and authenticated (gh auth login) with org admin access.
---

# GitHub Organization Setup Skill

Configure standard security and access settings for GitHub organizations.

## Standard Configuration

- **Default repository permission: `none`** (members have no access unless explicitly granted)
- **Members cannot create repositories** (admins create repos, then grant access)
- **Members cannot fork private repositories**
- **Web commit signoff not required** (optional, enable if needed)

## Steps

### 1. Audit current settings

```bash
gh api orgs/{org} --jq '{
  default_repository_permission,
  members_can_create_repositories,
  members_can_create_public_repositories,
  members_can_create_private_repositories,
  members_can_fork_private_repositories,
  two_factor_requirement_enabled,
  web_commit_signoff_required,
  members_can_create_pages,
  members_can_create_public_pages,
  members_can_create_private_pages,
  has_organization_projects,
  has_repository_projects
}'
```

### 2. Apply standard settings

```bash
gh api orgs/{org} -X PATCH \
  -f default_repository_permission=none \
  -F members_can_create_repositories=false \
  -F members_can_create_public_repositories=false \
  -F members_can_create_private_repositories=false \
  -F members_can_fork_private_repositories=false
```

### 3. Mirror settings between orgs

To copy settings from a source org to a target org:

```bash
# Compare two orgs
diff <(gh api orgs/{source_org} --jq '{default_repository_permission, members_can_create_repositories, members_can_create_public_repositories, members_can_create_private_repositories, members_can_fork_private_repositories, two_factor_requirement_enabled, web_commit_signoff_required}' | jq -S .) \
     <(gh api orgs/{target_org} --jq '{default_repository_permission, members_can_create_repositories, members_can_create_public_repositories, members_can_create_private_repositories, members_can_fork_private_repositories, two_factor_requirement_enabled, web_commit_signoff_required}' | jq -S .)
```

Then apply the desired values to the target org using the PATCH command above.

## Reference

### Default repository permission levels

| Value | Description |
|-------|-------------|
| `none` | Members have no access unless explicitly granted |
| `read` | Members can view and clone all repos |
| `write` | Members can push to all repos |
| `admin` | Members have full admin access to all repos |

Always prefer `none` and grant access explicitly per-repo or per-team.

### Configurable boolean settings

| Setting | Recommended | Description |
|---------|-------------|-------------|
| `members_can_create_repositories` | `false` | Prevent members from creating repos |
| `members_can_create_public_repositories` | `false` | Prevent members from creating public repos |
| `members_can_create_private_repositories` | `false` | Prevent members from creating private repos |
| `members_can_fork_private_repositories` | `false` | Prevent forking private repos |
| `web_commit_signoff_required` | `false` | Require signoff on web commits |
| `members_can_create_pages` | `true` | Allow GitHub Pages |
| `has_organization_projects` | `true` | Enable org-level projects |
| `has_repository_projects` | `true` | Enable repo-level projects |

### Managing members and teams

```bash
# List org members
gh api orgs/{org}/members --jq '.[].login'

# List teams
gh api orgs/{org}/teams --jq '.[] | {name, slug, permission}'

# Add member to a team
gh api orgs/{org}/teams/{team_slug}/memberships/{username} -X PUT -f role=member

# Set repo access for a team
gh api orgs/{org}/teams/{team_slug}/repos/{owner}/{repo} -X PUT -f permission=push
```

## Notes

- `two_factor_requirement_enabled` cannot be set via API — configure in the org's web UI under Settings > Authentication security.
- Always audit settings before applying changes, especially when mirroring between orgs.
- Use the `branch-protection` skill to configure per-repo ruleset and merge settings after org setup.
