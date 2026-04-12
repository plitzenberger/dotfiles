#!/usr/bin/env bash
# Collect trust signals for one or more GitHub repos (owner/name format).
# Outputs structured text per repo. Requires `gh` CLI authenticated.
#
# Usage: bash collect-signals.sh owner/repo [owner/repo ...]

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <owner/repo> [<owner/repo> ...]" >&2
  exit 1
fi

SINCE_90D=$(date -u -v-90d +"%Y-%m-%dT00:00:00Z" 2>/dev/null || date -u -d '90 days ago' +"%Y-%m-%dT00:00:00Z")
SINCE_30D=$(date -u -v-30d +"%Y-%m-%dT00:00:00Z" 2>/dev/null || date -u -d '30 days ago' +"%Y-%m-%dT00:00:00Z")

for REPO in "$@"; do
  OWNER="${REPO%%/*}"

  echo "================================================================"
  echo "REPO: $REPO"
  echo "================================================================"

  # --- Repo metadata ---
  echo "--- repo_meta ---"
  gh repo view "$REPO" --json name,stargazerCount,forkCount,pushedAt,createdAt,description,primaryLanguage,licenseInfo,isArchived,repositoryTopics,latestRelease --jq '{
    stars: .stargazerCount,
    forks: .forkCount,
    pushed: .pushedAt,
    created: .createdAt,
    desc: .description,
    lang: (.primaryLanguage.name // "none"),
    license: (.licenseInfo.name // "none"),
    archived: .isArchived,
    topics: [.repositoryTopics[]?.name] | join(", "),
    latest_release: (.latestRelease.tagName // "none")
  }' 2>&1

  # --- Author profile ---
  echo "--- author_profile ---"
  gh api "users/$OWNER" --jq '{
    name: .name,
    type: .type,
    company: .company,
    blog: .blog,
    bio: .bio,
    public_repos: .public_repos,
    followers: .followers,
    following: .following,
    created: .created_at,
    twitter: .twitter_username
  }' 2>&1

  # --- Author total stars ---
  echo "--- author_total_stars ---"
  gh api "users/$OWNER/repos?per_page=100&sort=stars" --jq '[.[].stargazers_count] | add // 0' 2>&1

  # --- Author top repos ---
  echo "--- author_top_repos ---"
  gh api "users/$OWNER/repos?per_page=100&sort=stars&direction=desc" \
    --jq '.[:8][] | "\(.stargazers_count) ⭐  \(.full_name) — \(.description // "no desc")"' 2>&1

  # --- Author orgs ---
  echo "--- author_orgs ---"
  gh api "users/$OWNER/orgs" --jq '[.[].login] | join(", ")' 2>&1

  # --- Commit activity (30d) ---
  echo "--- commits_30d ---"
  gh api "repos/$REPO/commits?since=$SINCE_30D&per_page=100" --jq 'length' 2>&1

  # --- Contributors ---
  echo "--- contributors ---"
  gh api "repos/$REPO/contributors?per_page=100" --jq 'length' 2>&1

  # --- Open issues ---
  echo "--- open_issues ---"
  gh api "repos/$REPO/issues?state=open&per_page=100" --jq 'length' 2>&1

  # --- File tree (check for tests, CI, license, changelog) ---
  echo "--- file_tree_signals ---"
  gh api "repos/$REPO/git/trees/HEAD?recursive=1" --jq '
    [.tree[] | select(.type=="blob") | .path] |
    {
      has_tests: (any(test("test|spec|__tests__"; "i"))),
      has_ci: (any(test("\\.github/workflows/"))),
      has_changelog: (any(test("CHANGELOG|CHANGES"; "i"))),
      has_license: (any(test("LICENSE|LICENCE"; "i"))),
      has_env_example: (any(test("\\.env\\.example"))),
      has_package_json: (any(test("^package\\.json$"))),
      has_postinstall: false,
      total_files: length
    }
  ' 2>&1

  # --- Check for postinstall in package.json ---
  echo "--- postinstall_check ---"
  gh api "repos/$REPO/contents/package.json" --jq '.content' 2>/dev/null | base64 -d 2>/dev/null | grep -c '"postinstall"' || echo "0"

  # --- Star concentration (single-repo dominance) ---
  echo "--- star_concentration ---"
  gh api "users/$OWNER/repos?per_page=100&sort=stars&direction=desc" --jq '
    (.[0].stargazers_count // 0) as $top |
    ([.[].stargazers_count] | add // 1) as $total |
    { top_repo_stars: $top, total_stars: $total, concentration: (if $total > 0 then ($top / $total * 100 | floor) else 0 end) }
  ' 2>&1

  echo ""
done
