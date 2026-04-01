---
name: pi-setup-improve
description: Improve your pi-mono setup by analyzing your dotfiles config and researching how top pi-mono contributors configure their own setups. Use when you want to optimize settings, discover new features, find better prompts, themes, skills, or packages.
compatibility: Requires gh CLI authenticated, web access tools.
---

# Pi Setup Improvement Skill

Improve your pi-mono configuration in `dotfiles/pi/` by learning from the top contributors who build and shape pi-mono.

## Your Setup Location

All pi configuration lives in: `dotfiles/pi/`

Key files:
- `settings.json` — core settings (model, theme, packages, etc.)
- `models.json` — model definitions
- `prompts/` — prompt templates
- `skills/` — custom skills
- `themes/` — color themes
- `openspec/config.yaml` — openspec workflow config

## Workflow

### Step 1: Understand Current Setup

Read and analyze the user's current pi config files in `dotfiles/pi/`. Identify what's configured: settings, models, prompts, skills, themes, packages.

### Step 2: ⚠️ CRITICAL — Research Expert Setups

**You MUST complete this step before making any recommendations.**

Search the GitHub profiles of the top 10 pi-mono contributors for their personal pi configurations (dotfiles, `.pi/` directories, settings, skills, prompts). These people build pi-mono — their setups reflect deep knowledge of what's possible.

**Top 10 pi-mono contributors (experts):**

| Rank | GitHub Handle | Contributions |
|------|--------------|---------------|
| 1 | **badlogic** | 2,509 |
| 2 | **hjanuschka** | 65 |
| 3 | **markusylisiurunen** | 38 |
| 4 | **aliou** | 38 |
| 5 | **Perlence** | 32 |
| 6 | **nicobailon** | 29 |
| 7 | **mitsuhiko** | 21 |
| 8 | **dannote** | 18 |
| 9 | **ferologics** | 18 |

For each expert, search for:

```bash
# Search their repos for pi config files
gh search repos "dotfiles" --owner <handle> --limit 5
gh search code ".pi" --owner <handle> --limit 10
gh search code "pi-mono" --owner <handle> --limit 10
gh search code "settings.json" --owner <handle> --filename "settings.json" --limit 5

# Check their dotfiles repo directly (common patterns)
gh api repos/<handle>/dotfiles/contents/.pi 2>/dev/null || true
gh api repos/<handle>/dotfiles/contents 2>/dev/null | jq -r '.[].name' 2>/dev/null || true

# Look for pi-related repos
gh search repos "pi" --owner <handle> --limit 10
```

Also use web search to find blog posts, discussions, or gists where they share pi-mono tips:

```bash
node <skill-dir>/../native-web-search/search.mjs "<handle> pi-mono config setup dotfiles" --purpose "find how this pi-mono contributor configures their pi setup"
```

### Step 3: Analyze pi-mono Repo for Latest Features

Check the pi-mono repo itself for features the user might be missing:

```bash
# Recent releases with new features
gh release list -R badlogic/pi-mono --limit 5
gh release view latest -R badlogic/pi-mono

# Check for example configs, default settings
gh api repos/badlogic/pi-mono/contents/examples 2>/dev/null || true
gh search code "settings.json" --repo badlogic/pi-mono --limit 10
```

### Step 4: Generate Recommendations

Compare the user's setup against what experts use and what's available. Provide recommendations organized as:

1. **Quick wins** — small config changes with high impact
2. **Missing features** — settings, packages, or skills the user isn't using but experts do
3. **Prompt improvements** — better prompt templates discovered from experts
4. **Theme/UX tweaks** — visual and ergonomic improvements
5. **Advanced setups** — power-user configurations found in expert dotfiles

For each recommendation:
- Explain **what** to change
- Explain **why** (cite which expert uses it or which feature it unlocks)
- Provide the exact config diff or file to add

### Step 5: Apply Changes

Only apply changes the user explicitly approves. Show diffs before writing.

## Important Notes

- Never skip Step 2. Expert research is the core value of this skill.
- Not all experts will have public dotfiles — that's fine, document what you find.
- The contributor list may become outdated; optionally refresh it via `gh api repos/badlogic/pi-mono/contributors?per_page=10`.
- Exclude bot accounts (e.g. `github-actions[bot]`) from research.
