# Agentic Workflow Patterns

## Subagent Chain Patterns

### Pattern 1: Scout → Plan → Build → Review

The standard development pipeline. Each step writes to `{chain_dir}`.

```bash
/chain scout[output=context.md] "analyze the auth module" \
  -> planner[reads=context.md,output=plan.md] "create implementation plan" \
  -> worker[reads=plan.md] "implement the plan" \
  -> reviewer "review all changes from {previous}"
```

Or programmatically:
```typescript
{ chain: [
  { agent: "scout", task: "Analyze auth module for {task}", output: "context.md" },
  { agent: "planner", reads: ["context.md"], output: "plan.md" },
  { agent: "worker", reads: ["plan.md"] },
  { agent: "reviewer" }
]}
```

### Pattern 2: Context-Builder → Delegate

For complex requirements where you need deep analysis before delegation.

```bash
/chain context-builder "understand the user story and codebase" -> delegate "implement based on {previous}"
```

### Pattern 3: Parallel Fan-Out for Auditing

Multiple scouts investigate different areas concurrently.

```bash
/parallel scout "audit authentication" -> scout "audit authorization" -> scout "audit data validation"
```

### Pattern 4: Fan-Out/Fan-In with Review

Parallel work followed by unified review.

```typescript
{ chain: [
  { agent: "scout", task: "Find all modules that need refactoring" },
  { parallel: [
    { agent: "worker", task: "Refactor auth module based on {previous}" },
    { agent: "worker", task: "Refactor user module based on {previous}" },
    { agent: "worker", task: "Refactor billing module based on {previous}" }
  ], concurrency: 2, failFast: true },
  { agent: "reviewer", task: "Review all refactoring changes from {previous}" }
]}
```

### Pattern 5: Research → Plan → Build

For greenfield work requiring external research.

```bash
/chain researcher "find best practices for WebSocket auth" \
  -> planner "create plan using {previous}" \
  -> worker "implement"
```

Requires `pi-web-access` extension for the researcher agent.

### Pattern 6: Quick Single Delegation

For simple subtasks that don't need a pipeline.

```bash
/run delegate "add error handling to src/api/auth.ts"
/run scout "find all TODO comments in the codebase"
/run reviewer "review the last 3 commits" --fork
```

Use `--fork` when the agent needs your current conversation context.

### Pattern 7: Background Long-Running Work

Fire-and-forget for time-consuming tasks.

```bash
/run scout "full security audit of the entire codebase" --bg
/chain scout -> planner -> worker --bg
```

Check status with: `subagent_status({ id: "<run-id>" })`

---

## Team Patterns

### Pattern 1: Specialist Team

Spawn domain experts for a complex project.

```
team_create("refactor-team")
spawn_teammate("refactor-team", "scanner", "Scan codebase for code smells and anti-patterns. Report findings.", cwd)
spawn_teammate("refactor-team", "architect", "Design the refactored architecture. Do NOT implement.", cwd)
spawn_teammate("refactor-team", "implementer", "Implement changes as directed by team-lead.", cwd)

task_create("refactor-team", "Code smell scan", "Scanner: identify all anti-patterns in src/")
task_create("refactor-team", "Architecture design", "Architect: propose new module structure")
```

### Pattern 2: Plan-Approval Workflow

Require review before agents make changes.

```
spawn_teammate("my-team", "careful-builder", "Implement features", cwd, plan_mode_required=true)
# Builder submits plan via task_submit_plan
# Lead reviews and approves/rejects via task_evaluate_plan
```

### Pattern 3: Predefined Team Templates

Define reusable team compositions in `~/.pi/teams.yaml`:

```yaml
full-dev:
  - scout
  - planner
  - builder
  - reviewer

quick-fix:
  - scout
  - builder
```

Launch: `create_predefined_team("my-project", "full-dev", cwd)`

Save runtime teams as templates: `save_team_as_template("my-team", "my-template")`

---

## Anti-Patterns

| Anti-Pattern | Problem | Fix |
|---|---|---|
| **Overlong chains** | 5+ steps → context degrades, cost explodes | Split into 2-3 step chains with file handoffs |
| **No output files** | Relying on `{previous}` for large outputs | Use `output`/`reads` to pass data via files |
| **Wrong model for task** | Using opus for simple grep tasks | Match model to complexity (haiku→recon, sonnet→impl, opus→planning) |
| **Deep nesting** | Subagents spawning subagents spawning subagents | Flatten into a chain or use teams |
| **Teams for pipelines** | Using messaging for sequential handoffs | Use subagent chains — teams are for collaboration |
| **No task board** | Teams with only messages, no tracked work | Always create tasks for visibility |
| **Forgetting `--fork`** | Agent needs conversation context but starts fresh | Use `context: "fork"` or `--fork` flag |
| **Orphaned teams** | Forgetting to shut down tmux panes | Always `team_shutdown` when done |

---

## Model Selection Guide

| Task Type | Recommended Model | Thinking | Rationale |
|-----------|-------------------|----------|-----------|
| File search, grep, recon | haiku | off | Speed over depth |
| Code implementation | sonnet | minimal-medium | Balance of quality and cost |
| Architecture planning | opus or sonnet | high | Deep reasoning needed |
| Code review | sonnet | medium | Catches subtle issues |
| Simple delegation | (inherit parent) | off | Minimal overhead |
| Research with web access | sonnet | low | Good comprehension |

---

## Agents Manager TUI

Open with `Ctrl+Shift+A` or `/agents`. Provides:

- Browse/search all agents and chains
- View resolved prompts and recent run history
- Edit agent fields with specialized pickers (model, thinking, skills)
- Create from templates (Scout, Planner, Implementer, Code Reviewer, Blank Chain)
- Multi-select agents → `Ctrl+R` for chain, `Ctrl+P` for parallel builder
- Clone (`Ctrl+K`) and delete (`Ctrl+D`) agents

Key bindings in list: `↑↓` navigate, `Enter` detail, `Tab` select, `Ctrl+N` new.
