# instructions/ — Rules & Instructions (Emerging Standard)

Persistent rules and instructions that apply across all agent sessions.

**Status**: Under discussion — VS Code is exploring this as part of `.agents/`
([microsoft/vscode#292410](https://github.com/microsoft/vscode/issues/292410)).

## Concept

Instructions are immutable constraints that fire on every task, every time.
Unlike skills (which activate on-demand), instructions are always-on context
that shapes agent behavior globally.

Think of them as the equivalent of:
- `CLAUDE.md` / `CLAUDE.local.md` for Claude Code
- `.cursor/rules/*.mdc` for Cursor
- `.github/copilot-instructions.md` for GitHub Copilot
- `.windsurf/rules/` for Windsurf

## Potential Structure

```
instructions/
├── code-style.md       # Coding conventions
├── security.md         # Security boundaries (never commit secrets, etc.)
├── testing.md          # Test requirements and patterns
├── git-workflow.md     # Branch naming, commit format, PR rules
└── architecture.md     # Project structure and design patterns
```

## Three-Tier Boundary Pattern

The most effective instructions use a three-tier system
([source: GitHub study of 2,500+ repos](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)):

```markdown
## Boundaries

### ✅ Always
- Run tests before commits
- Use TypeScript strict mode
- Follow naming conventions

### ⚠️ Ask First
- Database schema changes
- Adding new dependencies
- Modifying CI/CD configuration

### 🚫 Never
- Commit secrets or API keys
- Edit node_modules/ or vendor/
- Remove failing tests without approval
```

## Current Tool Support

| Tool | Native Location | Reads `.agents/instructions/`? |
|---|---|---|
| Claude Code | `CLAUDE.md` | Not yet |
| Cursor | `.cursor/rules/` | Not yet |
| GitHub Copilot | `.github/copilot-instructions.md` | Not yet |
| VS Code | `.vscode/instructions/` | Proposed |

> **Note**: This directory is forward-looking. Today, most tools read instructions
> from their own native paths. The `.agents/instructions/` convention is being
> discussed as a cross-tool standard. Use this to centralize your rules and
> symlink or copy to tool-specific locations as needed.
