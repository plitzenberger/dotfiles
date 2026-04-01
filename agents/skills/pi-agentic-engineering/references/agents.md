# Agent Definitions

## Agent File Format

Agents are markdown files with YAML frontmatter. The body is the system prompt.

```yaml
---
name: my-agent
description: What this agent does (required)
tools: read, grep, find, ls, bash          # comma-separated, optional
extensions:                                 # absent=all, empty=none, csv=allowlist
model: anthropic/claude-sonnet-4            # optional, inherits parent if absent
thinking: high                              # off, minimal, low, medium, high, xhigh
skill: safe-bash, code-review              # comma-separated skills to inject
output: context.md                         # default output file for chains
defaultReads: context.md                   # files to read before executing
defaultProgress: true                      # maintain progress.md
---

Your system prompt goes here. This is what the agent "is."
```

## File Locations (priority order)

| Scope | Path | Priority |
|-------|------|----------|
| Project | `.pi/agents/{name}.md` (searches up tree) | Highest |
| User | `~/.pi/agent/agents/{name}.md` | Medium |
| Builtin | Shipped with pi-subagents | Lowest |

Project agents override user agents. User agents override builtins.

## Chain Files

Chains are `.chain.md` files defining reusable multi-step pipelines.

```markdown
---
name: scout-planner
description: Gather context then plan implementation
---

## scout
output: context.md

Analyze the codebase for {task}

## planner
reads: context.md
model: anthropic/claude-sonnet-4-5:high
progress: true

Create an implementation plan based on {previous}
```

Each `## agent-name` section = one step. Config lines go right after the header, blank line separates config from task text.

Store in: `~/.pi/agent/agents/{name}.chain.md` (user) or `.pi/agents/{name}.chain.md` (project).

## Builtin Agent Details

### scout

Fast recon. Uses haiku for speed. Writes structured `context.md` with files retrieved, key code snippets, architecture notes, and "start here" guidance. Has three thoroughness levels (quick/medium/thorough) inferred from task.

### context-builder

Deep analysis. Uses sonnet. Produces two artifacts: `context.md` (code context) and `meta-prompt.md` (optimized instructions for the next agent). Good first step when requirements are complex or ambiguous.

### planner

Planning only — **never modifies files**. Uses opus with high thinking. Reads `context.md` by default. Produces numbered, actionable task lists with file paths, change descriptions, acceptance criteria, dependencies, and risks.

### worker

Implementation specialist. Executes plans. Has read, write, edit, bash tools.

### reviewer

Code review. Read-only tools. Checks for bugs, security issues, patterns.

### delegate

Minimal agent. Inherits parent model. No default reads or output. Use for quick one-off tasks that don't need specialized configuration.

### researcher

Web research agent. Requires `pi-web-access` extension for `web_search`, `fetch_content`, `get_search_content` tools.

## Writing Effective Agent Prompts

1. **Identity first** — "You are a [role]" establishes behavioral framing
2. **Scope the task** — What the agent does AND does not do
3. **Specify output format** — Exact structure with headers/sections
4. **Set thoroughness** — How deep to go based on task signals
5. **Keep it short** — Agent prompts load into every run's context

### Example: Custom Security Auditor

```yaml
---
name: security-auditor
description: Scans codebase for security vulnerabilities and misconfigurations
tools: read, grep, find, ls, bash
model: anthropic/claude-sonnet-4
output: security-report.md
---

You are a security auditor. Scan the codebase for vulnerabilities.

Focus areas:
- Hardcoded secrets, API keys, credentials
- SQL injection, XSS, CSRF patterns
- Insecure dependencies (check package.json/lock files)
- Missing input validation
- Overly permissive file/network access

Do NOT modify any files. Report only.

Output format (security-report.md):
# Security Audit Report
## Critical Issues
[severity: critical, with file:line references]
## Warnings
[severity: medium]
## Recommendations
[suggested fixes]
```

## Extension Sandboxing

Control which extensions a subagent can access:

```yaml
extensions:                              # empty = no extensions (lean)
extensions: /path/to/ext-a.ts           # allowlist specific extensions
# (absent = all extensions load)
```

## MCP Tools (requires pi-mcp-adapter)

```yaml
tools: read, bash, mcp:chrome-devtools           # all tools from server
tools: read, mcp:github/search_repositories       # specific tool
```

MCP tools are additive — they don't replace builtin tools.
