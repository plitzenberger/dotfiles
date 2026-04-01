---
name: pi-agentic-engineering
description: |
  Orchestrate multi-agent workflows in pi using pi-subagents and pi-teams.
  Use when the user asks to: delegate tasks to subagents, run agent chains or pipelines,
  coordinate a team of agents, spawn teammates, create or manage agent definitions,
  use /run /chain /parallel commands, set up predefined teams, or build any multi-agent
  workflow in pi. Also trigger when the user mentions scout, planner, worker, reviewer,
  context-builder, delegate, researcher agents, or asks about agent collaboration patterns.
  Do NOT use for single-session pi usage, general coding, or pi extension/theme development.
---

# Pi Agentic Engineering

Orchestrate multi-agent workflows in pi using two complementary packages:

| Package | Purpose | Mode |
|---------|---------|------|
| **pi-subagents** | Headless delegation — single, chain, parallel | Child processes, no UI |
| **pi-teams** | Coordinated agents in terminal panes with messaging | tmux/Zellij/iTerm2/WezTerm |

---

## Decision: Subagents vs Teams

| Use Case | Tool |
|----------|------|
| Quick subtask delegation | Subagents → `/run` |
| Multi-step pipeline (scout → plan → build → review) | Subagents → `/chain` |
| Fan-out same work to N agents concurrently | Subagents → `/parallel` |
| Long-running collaborative work with inter-agent messaging | Teams |
| Agents that need to talk to each other mid-task | Teams |
| Background autonomous work | Subagents → `--bg` |

**Rule of thumb:** If agents need to *communicate*, use teams. If agents need to *pipeline*, use subagents.

---

## Subagents Quick Reference

### Three Execution Modes

```bash
# Single — one agent, one task
/run scout "analyze the auth module"

# Chain — sequential pipeline, each step feeds {previous} to next
/chain scout "gather context" -> planner "create plan" -> worker "implement"

# Parallel — concurrent fan-out
/parallel scout "audit frontend" -> scout "audit backend"
```

### Chain Template Variables

| Variable | Description |
|----------|-------------|
| `{task}` | Original task from first step |
| `{previous}` | Output from prior step |
| `{chain_dir}` | Shared artifact directory for the chain run |

### Inline Per-Step Config

```bash
/chain scout[output=context.md] "scan code" -> planner[reads=context.md,model=anthropic/claude-sonnet-4] "plan"
```

Keys: `output`, `reads` (use `+` separator), `model`, `skills` (use `+`), `progress`.

### Background & Forked Context

```bash
/run scout "full audit" --bg          # Run in background
/chain scout -> planner --fork        # Fork parent session context
/run reviewer "review diff" --bg --fork  # Both
```

### Programmatic (LLM tool calls)

```typescript
// Single
{ agent: "scout", task: "analyze auth" }

// Chain
{ chain: [
  { agent: "scout", task: "Gather context for {task}" },
  { agent: "planner" },   // defaults to {previous}
  { agent: "worker" }
]}

// Parallel
{ tasks: [{ agent: "scout", task: "a" }, { agent: "scout", task: "b" }] }

// Chain with parallel fan-out step
{ chain: [
  { agent: "scout", task: "Find all modules" },
  { parallel: [
    { agent: "worker", task: "Refactor module A" },
    { agent: "worker", task: "Refactor module B" }
  ], concurrency: 2, failFast: true },
  { agent: "reviewer", task: "Review all changes from {previous}" }
]}
```

### Agent Management

```typescript
{ action: "list" }                                    // Discover agents
{ action: "get", agent: "scout" }                     // Inspect one
{ action: "create", config: { name, description, systemPrompt, tools, model, thinking, ... } }
{ action: "update", agent: "scout", config: { model: "openai/gpt-4o" } }
{ action: "delete", agent: "scout" }
```

---

## Teams Quick Reference

Requires tmux, Zellij, iTerm2, or WezTerm.

```
1. team_create(team_name="my-team")
2. spawn_teammate(team_name, name, prompt, cwd)
3. task_create(team_name, subject, description)
4. send_message / broadcast_message / read_inbox
5. task_list / task_update / check_teammate
6. team_shutdown(team_name)
```

For plan approval: `spawn_teammate(..., plan_mode_required=true)` → teammate submits plans via `task_submit_plan` → lead approves/rejects with `task_evaluate_plan`.

---

## Builtin Agents

For full agent definitions and custom agent authoring, see [references/agents.md](references/agents.md).

| Agent | Purpose | Model | Tools |
|-------|---------|-------|-------|
| `scout` | Fast codebase recon | haiku | read, grep, find, ls, bash, write |
| `context-builder` | Deep context + meta-prompt generation | sonnet | read, grep, find, ls, bash, web_search |
| `planner` | Implementation plans from context | opus (high thinking) | read, grep, find, ls, write |
| `worker` | (builtin) Execute implementation | — | read, write, edit, bash |
| `reviewer` | (builtin) Code review | — | read, grep, find, ls |
| `delegate` | Lightweight, inherits parent model | — | all defaults |
| `researcher` | Web research (needs pi-web-access) | — | web_search, fetch_content |

---

## Workflow Patterns

For common chain recipes, team compositions, and advanced patterns, see [references/patterns.md](references/patterns.md).

## GitHub Project Board Sync

Mirror pi-teams tasks to a GitHub Project kanban board for human visibility, commenting, and tracking. For full setup and commands, see [references/github-project-sync.md](references/github-project-sync.md).

**Quick start** (requires `gh auth refresh -s project` once):

```bash
source references/scripts/gh-project-sync.sh
ghsync_init "my-team"                                              # Create board
ISSUE=$(ghsync_create_task "my-team" "Build API" "Description" "backend")  # Mirror task
ghsync_update_status "$ISSUE" "in_progress"                        # Move column
ghsync_comment "$ISSUE" "backend" "Endpoint implemented"           # Agent comment
ghsync_complete "$ISSUE"                                           # Done + close
ghsync_board                                                       # Open in browser
```

Mapping: `task_create` → issue + board card, `task_update` → column move, `send_message` → issue comment, `task_submit_plan` → plan comment, `task_evaluate_plan` → approve/reject comment + label.

---

## Rules

- **Start simple.** Use `/run` before reaching for `/chain`. Use `/chain` before teams.
- **Match agent to task complexity.** Use haiku for recon, sonnet for implementation, opus for planning.
- **Use `output` and `reads` for chain data flow.** Don't rely on `{previous}` alone for large outputs — write to files in `{chain_dir}`.
- **Scope tools tightly.** Give scout read-only tools. Give worker write tools. Least privilege.
- **Don't nest subagents deeply.** Default max depth is 2. If you need deeper, rethink the architecture.
- **Prefer `context: "fork"` when the subagent needs your conversation context.** Fresh is default and faster.
- **For teams, create tasks first.** Don't just message — use the task board for tracking.
- **Always shut down teams.** Orphaned tmux panes waste resources.

---

## Verification

After setting up an agentic workflow, verify:

- [ ] Agent definitions resolve correctly (`{ action: "list" }` or `/agents`)
- [ ] Chain data flows through `{previous}` / files as expected
- [ ] Output files land in `{chain_dir}` (chains) or expected paths (solo)
- [ ] Background runs complete (`subagent_status`)
- [ ] Team messages are received (`read_inbox`)
- [ ] Tasks have correct owners and statuses (`task_list`)
