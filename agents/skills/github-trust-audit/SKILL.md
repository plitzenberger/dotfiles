---
name: github-trust-audit
description: >
  Audit GitHub authors and repositories for trustworthiness before installing
  extensions, packages, or dependencies. Produces a scored trust report.
  Use when: evaluate extension author, trust check, should I install this,
  is this repo safe, audit GitHub user, compare extension authors, vet a package,
  trust ranking, author reputation check.
  Do NOT use for: general GitHub CLI operations, repo creation, PR management.
---

# GitHub Trust Audit

Score GitHub authors and repos on trustworthiness before installing their code.
Requires `gh` CLI authenticated.

## When to Use

- Before installing pi extensions, npm packages, or any third-party code
- When comparing multiple authors/repos for the same capability
- When a user asks "is this safe?" or "should I trust this?"

## Workflow

### 1. Collect Signals

Run the data collection script for each author:

```bash
bash scripts/collect-signals.sh <owner/repo> [<owner/repo> ...]
```

This outputs JSON with all raw signals. For author-only audits (no specific repo):

```bash
bash scripts/collect-author.sh <username> [<username> ...]
```

### 2. Score

Apply the scoring rubric from `references/scoring-rubric.md` to the collected signals.
Compute a composite trust score (0–100) per author using the weighted dimensions.

### 3. Report

Present results as a comparison table with:
- Composite score and tier (🟢 Trusted / 🟡 Caution / 🔴 Avoid)
- Per-dimension breakdown
- Key flags (positive and negative)
- Actionable recommendation

## Scoring Dimensions (summary)

| Dimension | Weight | Key Signals |
|-----------|--------|-------------|
| Identity | 20% | Real name, company, blog, social links |
| Reputation | 20% | Followers, total stars, org memberships |
| Track Record | 25% | Account age, repo diversity, pre-existing projects |
| Ecosystem | 15% | Upstream contributions, multiple related extensions |
| Code Quality | 20% | Releases, tests, license, changelogs, activity |

Full rubric with thresholds: `references/scoring-rubric.md`

## Red Flags (auto-fail or heavy penalty)

- Account < 1 year old
- Bio says "AI generated" or similar
- Zero followers + zero non-fork repos
- No license on code you'd execute
- Archived or abandoned (0 commits in 90 days)

## Green Flags (bonus)

- Commits to the upstream project (e.g., pi-mono)
- Known employer / company verifiable independently
- Published npm packages with semver releases
- Test suites present
- Multiple contributors

## References

- `references/scoring-rubric.md` — Full scoring rubric with point thresholds
- `references/red-green-flags.md` — Detailed flag definitions and examples
- `scripts/collect-signals.sh` — Data collection for repo + author
- `scripts/collect-author.sh` — Author-only data collection
