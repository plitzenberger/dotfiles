# skills/ — Agent Skills (Open Standard)

Cross-tool skill packages following the [Agent Skills specification](https://agentskills.io).

## How It Works

1. At session start, tools scan this directory for `<name>/SKILL.md` files
2. Only `name` + `description` from frontmatter are loaded initially (~50-100 tokens each)
3. Full instructions load on-demand when the agent decides a skill is relevant
4. Scripts, references, and assets load progressively as needed

## Skill Structure

```
skill-name/
├── SKILL.md          # Required — YAML frontmatter + markdown instructions
├── scripts/          # Optional — executable code the agent can run
├── references/       # Optional — detailed docs loaded on demand
└── assets/           # Optional — templates, configs, data files
```

## SKILL.md Format

```yaml
---
name: skill-name              # Required. Lowercase, hyphens only. Must match folder name.
description: |                # Required. Max 1024 chars. What it does + when to use it.
  Extracts text from PDFs.
  Use when the user mentions PDFs or document extraction.
license: Apache-2.0           # Optional.
compatibility: Requires jq    # Optional. Environment requirements.
allowed-tools: Bash(git:*)    # Optional, experimental. Pre-approved tools.
metadata:                     # Optional. Arbitrary key-value pairs.
  author: example-org
  version: "1.0"
---

# Skill Name

Detailed instructions for the agent.

## Steps
1. Do this
2. Then that
```

## Scope & Precedence

| Location | Scope |
|---|---|
| `~/.agents/skills/` | User-level (this directory) |
| `<project>/.agents/skills/` | Project-level (overrides user-level) |

Project-level skills with the same `name` shadow user-level ones.

## Tips

- Keep `SKILL.md` under 500 lines; move detail to `references/`
- Description quality determines whether the agent activates the skill — be specific
- Scripts should be self-contained with helpful error messages
