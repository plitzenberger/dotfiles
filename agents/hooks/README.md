# hooks/ — Lifecycle Hooks (Emerging Standard)

Scripts that run at specific points in the agent workflow.

**Status**: Under discussion — VS Code is exploring this as part of `.agents/`
([microsoft/vscode#292410](https://github.com/microsoft/vscode/issues/292410)).

## Concept

Hooks let you inject custom logic at lifecycle events — before/after file edits,
before commits, after test runs, on session start/end. They act as guardrails
and automation triggers that complement skills and rules.

## Potential Hook Points

| Hook | When |
|---|---|
| `pre-edit` | Before the agent modifies a file |
| `post-edit` | After a file is modified |
| `pre-commit` | Before committing changes |
| `post-commit` | After a commit is made |
| `on-error` | When the agent encounters an error |
| `session-start` | When a new agent session begins |
| `session-end` | When a session ends |

## Current Tool Support

- **Cursor**: Supports hooks in `.cursor/hooks/` (shipped)
- **VS Code**: Proposed for `.agents/hooks/` (discussion phase)
- **Claude Code**: Hooks via `~/.claude/hooks/` or project-level

## Example

```bash
#!/bin/bash
# hooks/pre-commit — run linter before any commit
npm run lint:fix
```

> **Note**: The exact format and hook naming is not yet standardized across tools.
> Experiment here and adapt as the standard solidifies.
