# agents/ — Agent Definitions (Emerging Standard)

Custom agent personas as `*.agent.md` files.

**Status**: Under active discussion — VS Code is standardizing this
([microsoft/vscode#292410](https://github.com/microsoft/vscode/issues/292410)).

## Concept

Agent definitions let you create specialized personas — a `@docs-agent` for
technical writing, a `@test-agent` for QA, a `@security-agent` for code review.
Each file defines a focused agent with its own role, capabilities, and boundaries.

## Expected Format

```markdown
# docs-agent

## Role
You are a technical documentation specialist.

## Capabilities
- Write and update markdown documentation
- Generate API references from source code
- Maintain changelog entries

## Boundaries
- Never modify source code
- Always follow the project's doc style guide
```

## Tool Support

- **VS Code**: Proposed in `.agents/agents/` ([#292410](https://github.com/microsoft/vscode/issues/292410))
- **GitHub Copilot**: Uses `agents.md` files for specialized personas
- **Cursor**: Subagents defined in `.cursor/agents/` or `.agents/agents/`

## See Also

- [GitHub: How to write a great agents.md](https://github.blog/ai-and-ml/github-copilot/how-to-write-a-great-agents-md-lessons-from-over-2500-repositories/)
