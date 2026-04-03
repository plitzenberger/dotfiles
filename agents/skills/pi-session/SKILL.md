---
name: pi-session
description: |
  Find, inspect, and extract metadata from pi coding agent sessions
  stored in ~/.pi/agent/sessions/. Use when looking up session stats,
  finding a session by date/project/UUID, summarising session content,
  or extracting session metadata for downstream use.
  Triggers on: pi session, session stats, find session, session summary,
  session search, session metadata, session lookup.
  Do NOT use for creating or editing notes/documents — this skill only
  reads and analyses raw session JSONL files.
---

# Pi Session Lookup

Find, inspect, and extract metadata from pi coding agent sessions.

## Scripts

Reusable Python scripts live in `scripts/` relative to this skill file. Always use these instead of inline one-liners.

| Script | Purpose | Usage |
|---|---|---|
| `stats.py` | Extract all session metadata (id, model, messages, tools, timestamps, cost) | `python3 <scripts>/stats.py <session-file>` |
| `summary.py` | Extract user messages for content understanding | `python3 <scripts>/summary.py <session-file> [max-messages]` |
| `summarize.py` | Smart summary with priority on recent messages | `python3 <scripts>/summarize.py <file-or-uuid> [--last N] [--first N] [--all]` |
| `key-points.py` | Extract decisions, files modified, commands, errors, outcomes | `python3 <scripts>/key-points.py <file-or-uuid>` |
| `find-topic.py` | Find sessions about a topic across all projects or a folder | `python3 <scripts>/find-topic.py <topic> [sessions-folder]` |
| `search.py` | Search sessions by keywords in a single folder | `python3 <scripts>/search.py <sessions-folder> <kw1> [kw2] ...` |
| `today.sh` | List today's sessions, optionally scoped to a project | `<scripts>/today.sh [project-path]` |
| `list-sessions.sh` | List recent sessions across all projects | `<scripts>/list-sessions.sh [count]` |
| `session-by-project.sh` | List sessions for a specific project path | `<scripts>/session-by-project.sh <project-path> [count]` |

> **Resolve `<scripts>` to the absolute path** of the `scripts/` directory next to this SKILL.md before running.

## Session Storage

Sessions are JSONL files stored in:
```
~/.pi/agent/sessions/<encoded-cwd>/<timestamp>_<uuid>.jsonl
```

- **Encoded CWD:** path with `/` replaced by `-`, wrapped in `--`. Example: `--Users-litzi-Documents-myproject--`
- **Filename:** `YYYY-MM-DDTHH-mm-ss-mmmZ_<uuid>.jsonl`

### Session Version

Sessions have a `version` field in the header:
- **Version 1**: Linear entry sequence (legacy, auto-migrated on load)
- **Version 2**: Tree structure with `id`/`parentId` linking
- **Version 3**: Renamed `hookMessage` role to `custom` (current)

### JSONL Entry Types

All entries (except the session header) have `id`, `parentId`, and `timestamp` fields forming a tree.

| Type | Key Fields | Notes |
|---|---|---|
| `session` | `id`, `timestamp`, `cwd`, `version` | First line. Session UUID, start time, version. No `id`/`parentId`. |
| `session_info` | `name` | Session name (from `pi --name "..."` or `/name` command). |
| `model_change` | `provider`, `modelId` | Model used. Take the **last** occurrence (user may switch). |
| `thinking_level_change` | `thinkingLevel` | e.g. `medium`, `high`. |
| `message` | `message.role`, `message.content` | Roles: `user`, `assistant`, `toolResult`, `bashExecution`, `custom`. |
| `compaction` | `summary`, `firstKeptEntryId`, `tokensBefore` | Context compaction summary. |
| `branch_summary` | `summary`, `fromId` | Summary of an abandoned branch. |
| `custom` | `customType`, `data` | Extension state persistence (not in LLM context). |
| `custom_message` | `customType`, `content`, `display` | Extension-injected message (in LLM context). |
| `label` | `targetId`, `label` | User-defined bookmark on an entry. |

> **No top-level `usage` entry in v3.** Usage data is now embedded in assistant messages as `message.usage`.

### Message Content Structure

Assistant message `content` is a list of blocks:

| Block `type` | What it is |
|---|---|
| `text` | Text response |
| `thinking` | Chain-of-thought |
| `toolCall` | Tool invocation (has `id`, `name`, `arguments`) |
| `image` | Base64-encoded image (has `data`, `mimeType`) |

Assistant messages also carry: `provider`, `model`, `usage`, `stopReason`.

### Usage Structure (on assistant messages)

```json
{
  "input": 1234,
  "output": 567,
  "cacheRead": 890,
  "cacheWrite": 100,
  "totalTokens": 2791,
  "cost": {
    "input": 0.01,
    "output": 0.02,
    "cacheRead": 0.001,
    "cacheWrite": 0.002,
    "total": 0.033
  }
}
```

> ⚠️ The block type is `toolCall`, **not** `tool_use`. The scripts handle both for safety.
> ⚠️ Legacy sessions may use flat `inputTokens`/`outputTokens`/`totalCost` at the top level — scripts handle both formats.

## Session Discovery

### By UUID (partial match)
```bash
find ~/.pi/agent/sessions/ -name "*<partial-uuid>*" -type f
```

### By project path
```bash
ls ~/.pi/agent/sessions/ | grep -i "<project-name>"
```

### By date
```bash
find ~/.pi/agent/sessions/ -name "YYYY-MM-DD*" -type f
```

### By session folder path

When the user provides a project/repo path, encode it:

```bash
ENCODED=$(echo "<path>" | sed 's|^/||;s|/$||;s|/|-|g' | sed 's|^|--|;s|$|--|')
ls -lt ~/.pi/agent/sessions/$ENCODED/
```

### By topic (content search)

Use `search.py` — it searches `session_info.name` and all user/assistant message text:

```bash
python3 <scripts>/search.py ~/.pi/agent/sessions/<encoded-folder>/ "keyword1" "keyword2"
```

> ⚠️ **Date and folder are filters, not proof of relevance.** Always verify content with `summary.py`.

## Workflow: Understanding a Session

1. **Run `stats.py`** — get metadata (id, model, timestamps, message/tool counts, cost)
2. **Run `summary.py`** — read user messages to understand what the session was about
3. **Derive a descriptive title from content** — be specific, not generic

### Deriving Title and Summary

| Source | Use for |
|---|---|
| User messages | **Title** — what was the user trying to accomplish? |
| `session_info.name` | **Hint** — but may be vague; always verify against messages |
| First assistant response | **Context** — what state was the project in? |
| Final assistant responses | **Outcomes** — what was achieved or decided? |

**Title rules:**
- Derive from the actual work, NOT the folder name or project name
- Be specific: "Auth Module Refactoring" not "Project Session 3"
- No UUIDs, no incrementing numbers, no generic labels

**Summary rules:**
- Lead with the core question or problem addressed
- Include key findings, decisions, or outputs
- Name specific artifacts created (files, commits, reports)
- 2-4 sentences max

## Metadata Fields from `stats.py`

| Field | Description |
|---|---|
| `pi-session` | Session UUID |
| `pi-model` | Model used (empty if no `model_change` entry, e.g. team-spawned sessions) |
| `pi-messages` | Total user + assistant message count |
| `pi-tools` | Tool call count |
| `pi-tokens` | Total token count (empty if no usage data) |
| `pi-cost` | Total cost in USD (empty if no usage data) |
| `start-local` | Local start time (from session header) |
| `end-local` | Local end time (from last message timestamp) |

## Resume a Session

```bash
# By UUID (partial match works)
pi --session <uuid>

# By file path
pi --session <path-to-jsonl>

# Continue most recent session in current project
pi -c
```

## Rules

1. **Use the scripts.** Do NOT write inline Python one-liners. The scripts in `scripts/` handle schema variations, legacy formats, and edge cases.
2. **Content before metadata.** Run `summary.py` to understand what a session is about BEFORE extracting stats.
3. **Titles from content, not containers.** Derive the session title from what was actually done, not from the project name, folder, or UUID.
4. **Check adjacent dates.** "Today's sessions" might span midnight or the user may mean "recent." Check ±1 day if initial results seem incomplete.
5. **Empty values are fine.** Some sessions lack `model_change` or `usage` entries (e.g. team-spawned sub-sessions). Report empty — do not guess.
6. **Handle both legacy and v3 formats.** Scripts must tolerate flat `inputTokens`/`totalCost` (legacy) and nested `usage.cost.total` (v3) gracefully.
