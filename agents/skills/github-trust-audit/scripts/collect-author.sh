#!/usr/bin/env bash
# Collect trust signals for one or more GitHub authors (username only).
# Outputs structured text per author. Requires `gh` CLI authenticated.
#
# Usage: bash collect-author.sh username [username ...]

set -euo pipefail

if [ $# -eq 0 ]; then
  echo "Usage: $0 <username> [<username> ...]" >&2
  exit 1
fi

for OWNER in "$@"; do
  echo "================================================================"
  echo "AUTHOR: $OWNER"
  echo "================================================================"

  # --- Profile ---
  echo "--- profile ---"
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

  # --- Orgs ---
  echo "--- orgs ---"
  gh api "users/$OWNER/orgs" --jq '[.[].login] | join(", ")' 2>&1

  # --- Total stars ---
  echo "--- total_stars ---"
  gh api "users/$OWNER/repos?per_page=100&sort=stars" --jq '[.[].stargazers_count] | add // 0' 2>&1

  # --- Top repos ---
  echo "--- top_repos ---"
  gh api "users/$OWNER/repos?per_page=100&sort=stars&direction=desc" \
    --jq '.[:8][] | "\(.stargazers_count) ⭐  \(.full_name) — \(.description // "no desc")"' 2>&1

  # --- Star concentration ---
  echo "--- star_concentration ---"
  gh api "users/$OWNER/repos?per_page=100&sort=stars&direction=desc" --jq '
    (.[0].stargazers_count // 0) as $top |
    ([.[].stargazers_count] | add // 1) as $total |
    { top_repo_stars: $top, total_stars: $total, concentration: (if $total > 0 then ($top / $total * 100 | floor) else 0 end) }
  ' 2>&1

  # --- Recent activity ---
  echo "--- recent_events ---"
  gh api "users/$OWNER/events?per_page=10" \
    --jq '.[] | "\(.type) → \(.repo.name) (\(.created_at))"' 2>&1

  # --- Repo age distribution ---
  echo "--- repo_age_summary ---"
  gh api "users/$OWNER/repos?per_page=100&sort=created&direction=desc" --jq '
    (now | strftime("%Y")) as $year |
    group_by(.created_at[:4]) | map({year: .[0].created_at[:4], count: length}) |
    sort_by(.year) | reverse | .[:5][] | "\(.year): \(.count) repos"
  ' 2>&1

  echo ""
done
