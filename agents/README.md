# ~/.agents/ — Cross-Tool Agent Configuration

Managed via Nix Home Manager (`home/features/cli/agents.nix`).
Each subdirectory is symlinked to `~/.agents/` for live editing.

## Structure

```
~/.agents/
├── skills/          # SKILL.md packages — widely supported (30+ tools)
├── agents/          # *.agent.md definitions — emerging (VS Code #292410)
├── hooks/           # Lifecycle hooks — emerging (VS Code discussion)
└── instructions/    # Rules & instructions — emerging (VS Code discussion)
```

## Standards

- **Agent Skills spec**: https://agentskills.io
- **AGENTS.md spec**: https://agents.md
- **VS Code proposal**: https://github.com/microsoft/vscode/issues/292410

## Supported Tools

`skills/` is scanned by: Cursor, VS Code, Claude Code, OpenAI Codex, GitHub Copilot,
Gemini CLI, Windsurf, Amp, Junie (JetBrains), Roo Code, OpenCode, Goose, pi,
Factory, Snowflake, Firebender, TRAE, Mistral Vibe, Kiro, Qodo, and more.

## Adding a Skill

```
skills/
└── my-skill/
    ├── SKILL.md          # Required: YAML frontmatter + markdown body
    ├── scripts/          # Optional: executable code
    ├── references/       # Optional: docs loaded on demand
    └── assets/           # Optional: templates, configs
```

Minimal `SKILL.md`:

```yaml
---
name: my-skill
description: What this does and when to use it.
---

# My Skill

Instructions for the agent.
```
