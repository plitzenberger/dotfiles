# Scoring Rubric

Composite score = weighted sum of 5 dimensions, each scored 0–20.
Total range: 0–100.

## Tiers

| Score | Tier | Label | Action |
|-------|------|-------|--------|
| 80–100 | 🟢 | Trusted | Install confidently |
| 60–79 | 🟡 | Caution | Review code before installing |
| 40–59 | 🟠 | Risky | Inspect thoroughly, consider alternatives |
| 0–39 | 🔴 | Avoid | Do not install without full audit |

## Dimension 1: Identity (20%)

Score 0–20 based on verifiable real-world identity.

| Points | Criteria |
|--------|----------|
| 0 | No name, no bio, no links |
| 5 | Username only, partial bio |
| 10 | Real name + bio OR company listed |
| 15 | Real name + company + blog/website |
| 20 | All above + verifiable externally (LinkedIn, Twitter, conference talks) |

## Dimension 2: Reputation (20%)

Score 0–20 based on community standing.

| Points | Criteria |
|--------|----------|
| 0 | 0 followers, 0 total stars |
| 5 | 1–20 followers OR 1–50 total stars |
| 10 | 21–100 followers OR 51–500 total stars |
| 15 | 101–500 followers OR 501–2000 total stars |
| 20 | 500+ followers OR 2000+ total stars OR member of known orgs |

**Star inflation check**: If >60% of total stars come from a single repo,
reduce score by 3 points. Viral repos ≠ sustained reputation.

## Dimension 3: Track Record (25%)

Score 0–25 based on history and consistency.

| Points | Criteria |
|--------|----------|
| 0 | Account < 6 months |
| 5 | Account 6mo–2yr, < 10 repos |
| 10 | Account 2–5yr, 10–30 repos |
| 15 | Account 5–10yr, diverse project types |
| 20 | Account 10yr+, multiple languages/domains |
| 25 | All above + repos show clear professional progression |

**Burst check**: If >50 repos created in last 3 months, reduce by 5.
May indicate bulk AI generation.

## Dimension 4: Ecosystem Contribution (15%)

Score 0–15 based on contributions to the relevant ecosystem.

| Points | Criteria |
|--------|----------|
| 0 | No ecosystem involvement |
| 5 | 1–2 repos in the ecosystem |
| 8 | 3+ repos in ecosystem OR issues/discussions filed upstream |
| 12 | Commits accepted to the upstream project |
| 15 | Core contributor or maintainer of upstream |

## Dimension 5: Code Quality (20%)

Score 0–20 based on engineering practices in the repo being evaluated.

| Points | Criteria |
|--------|----------|
| 0 | No license, no readme, no structure |
| 5 | README exists, basic structure |
| 10 | License + README + releases OR changelog |
| 15 | Above + tests + multiple contributors |
| 20 | Above + CI/CD + semver releases + npm published + active issue triage |

## Modifiers (applied after base score)

| Modifier | Effect |
|----------|--------|
| Account < 1 year | –10 penalty |
| Bio mentions "AI generated" | –15 penalty |
| 0 commits in 90 days (not archived) | –10 penalty |
| Upstream commits accepted | +5 bonus |
| Daily professional activity (non-extension) | +5 bonus |
| Known company/employer verifiable | +5 bonus |

Cap final score at 0–100.

## Reporting Format

Present as a table:

```
| Author | Identity | Reputation | Track | Ecosystem | Quality | Mods | Total | Tier |
|--------|----------|------------|-------|-----------|---------|------|-------|------|
| alice  | 15/20    | 12/20      | 20/25 | 8/15      | 15/20   | +5   | 75    | 🟡   |
```

Follow with per-author notes explaining key flags.
