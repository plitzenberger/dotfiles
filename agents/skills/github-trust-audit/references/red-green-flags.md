# Red & Green Flags

Flags override or modify the base score. Always call out flags explicitly in the report.

## Red Flags 🔴

### Critical (auto-reduce to 🔴 Avoid)

| Flag | Detection | Why it matters |
|------|-----------|---------------|
| Account < 6 months + 0 followers | `created_at` + `followers` | Throwaway or sock puppet account |
| Repo contains obfuscated code | Manual inspection | Could hide malicious payloads |
| Install script runs `curl \| bash` from external URL | Check README install steps | Unauditable remote code execution |

### Severe (–15 points)

| Flag | Detection | Why it matters |
|------|-----------|---------------|
| Bio says "AI generated" / "vibe coded" | `bio` field | Author may not understand their own code |
| All repos created in < 1 week | `created_at` on repos | Likely bulk-generated, untested |
| Fork-only account (0 original repos) | `is_fork` on all repos | No demonstrated original work |

### Moderate (–10 points)

| Flag | Detection | Why it matters |
|------|-----------|---------------|
| Account < 1 year | `created_at` | Limited track record |
| No license | `licenseInfo` | Legal risk, unclear permissions |
| 0 commits in 90 days (not archived) | `pushedAt` | Possibly abandoned |
| High commit volume + low followers | Commits/30d vs followers | May be AI-assisted bulk generation |

### Minor (–5 points)

| Flag | Detection | Why it matters |
|------|-----------|---------------|
| No README or minimal README | API readme check | Low effort, hard to evaluate |
| Extension has `postinstall` script | Check `package.json` | Runs code on install |
| Single-file repo, no structure | Tree API | Likely throwaway experiment |

## Green Flags 🟢

### Strong (+5 points each, max +15)

| Flag | Detection | Why it matters |
|------|-----------|---------------|
| Commits to upstream project | Check upstream commit authors | Trusted by core team |
| Known employer (verifiable) | `company` + external check | Real professional identity |
| Daily professional commits (non-extension) | Recent events API | Actually uses GitHub for work |
| Published npm with semver | `latestRelease` + npm registry | Follows release discipline |

### Moderate (+3 points each)

| Flag | Detection | Why it matters |
|------|-----------|---------------|
| Multiple contributors | Contributors API | Code reviewed by others |
| Test suite present | File tree scan for test files | Cares about correctness |
| CHANGELOG or release notes | File tree or releases API | Documents changes |
| Active issue triage | Open vs closed issues ratio | Maintains the project |

### Minor (+1 point each)

| Flag | Detection | Why it matters |
|------|-----------|---------------|
| CI/CD config present | `.github/workflows/` in tree | Automated quality checks |
| `.env.example` present | File tree | Follows security practices |
| TypeScript (not raw JS) | `primaryLanguage` | Type safety for extensions |

## Combining Flags

- Flags stack additively on top of the base dimension score
- Critical red flags override the final tier to 🔴 regardless of score
- Green flags are capped at +15 total bonus
- Always list the top 3 flags (positive or negative) in the report summary
