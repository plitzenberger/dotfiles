#!/usr/bin/env python3
"""Extract key points from a session: decisions, artifacts, commands, and outcomes.

Usage: python3 key-points.py <session-file-or-uuid>

Scans the session and extracts:
  - Files created/modified (from Write/Edit tool calls)
  - Commands run (from Bash tool calls)
  - Key decisions (from assistant text heuristics)
  - Errors encountered (from tool results with isError)
  - Session overview (first user message + last assistant text)
"""
import json
import os
import re
import sys
from collections import OrderedDict
from datetime import datetime, timezone


def find_by_uuid(partial_uuid):
    sessions_dir = os.path.expanduser("~/.pi/agent/sessions")
    for dirpath, _, filenames in os.walk(sessions_dir):
        for f in filenames:
            if partial_uuid in f and f.endswith(".jsonl"):
                return os.path.join(dirpath, f)
    return None


if len(sys.argv) < 2 or sys.argv[1] in ("-h", "--help"):
    print("Usage: python3 key-points.py <session-file-or-uuid>")
    sys.exit(0)

target = sys.argv[1]
if os.path.isfile(target):
    filepath = target
else:
    filepath = find_by_uuid(target)
    if not filepath:
        print(f"Error: Could not find session for: {target}", file=sys.stderr)
        sys.exit(1)

# --- Accumulators ---
session_id = ""
session_name = ""
session_ts = ""
cwd = ""
model = ""

files_written = OrderedDict()   # path -> "created" | "edited"
files_read = OrderedDict()      # path -> count
commands_run = []               # (command_preview, exit_code_or_none)
errors = []                     # (tool_name, error_preview)
first_user_msg = ""
last_assistant_text = ""
compaction_summaries = []
decisions = []                  # Extracted decision-like statements


def extract_text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return "\n".join(
            c.get("text", "")
            for c in content
            if isinstance(c, dict) and c.get("type") == "text"
        )
    return ""


def extract_tool_calls(content):
    """Extract tool calls from assistant message content blocks."""
    if not isinstance(content, list):
        return []
    return [
        c for c in content
        if isinstance(c, dict) and c.get("type") in ("toolCall", "tool_use")
    ]


# Decision heuristics — phrases that signal a decision or conclusion
DECISION_PATTERNS = [
    r"(?:I'll|I will|Let's|We should|The (?:best|right) approach is|decided to|going with|choosing)",
    r"(?:instead of|rather than|the plan is|strategy:|approach:)",
    r"(?:✅|Done\.|Complete\.|Finished\.|Created|Updated|Migrated|Refactored)",
]
DECISION_RE = re.compile("|".join(DECISION_PATTERNS), re.IGNORECASE)


with open(filepath) as fh:
    for line in fh:
        entry = json.loads(line)
        etype = entry.get("type", "")

        if etype == "session":
            session_id = entry.get("id", "")
            session_ts = entry.get("timestamp", "")
            cwd = entry.get("cwd", "")

        elif etype == "session_info":
            session_name = entry.get("name", "")

        elif etype == "model_change":
            model = entry.get("modelId", "")

        elif etype == "compaction":
            compaction_summaries.append(entry.get("summary", ""))

        elif etype == "message":
            msg = entry.get("message", {})
            role = msg.get("role", "")
            content = msg.get("content", "")

            if not model and role == "assistant" and msg.get("model"):
                model = msg["model"]

            if role == "user":
                text = extract_text(content)
                if not first_user_msg and text.strip():
                    first_user_msg = text.strip()

            elif role == "assistant":
                text = extract_text(content)
                if text.strip():
                    last_assistant_text = text.strip()

                # Extract decisions from text
                for line_text in text.split("\n"):
                    line_text = line_text.strip()
                    if len(line_text) > 20 and DECISION_RE.search(line_text):
                        # Avoid tool output noise
                        if not line_text.startswith(("```", "|", "  ", "{", "[")):
                            decisions.append(line_text[:200])

                # Track tool calls
                for tc in extract_tool_calls(content):
                    name = tc.get("name", "")
                    args = tc.get("arguments", {})

                    if name in ("Write", "write"):
                        path = args.get("path", "?")
                        files_written[path] = "created"
                    elif name in ("Edit", "edit"):
                        path = args.get("path", "?")
                        if path not in files_written:
                            files_written[path] = "edited"
                    elif name in ("Read", "read"):
                        path = args.get("path", "?")
                        files_read[path] = files_read.get(path, 0) + 1
                    elif name in ("Bash", "bash"):
                        cmd = args.get("command", "")
                        if cmd:
                            commands_run.append(cmd[:120])

            elif role == "toolResult":
                if msg.get("isError"):
                    tool_name = msg.get("toolName", "?")
                    err_text = extract_text(msg.get("content", ""))[:150]
                    errors.append((tool_name, err_text))

            elif role == "bashExecution":
                cmd = msg.get("command", "")
                if cmd:
                    commands_run.append(cmd[:120])


# --- Output ---
local_date = ""
if session_ts:
    try:
        utc_dt = datetime.fromisoformat(session_ts.replace("Z", "+00:00"))
        local_dt = utc_dt.astimezone()
        local_date = local_dt.strftime("%Y-%m-%d %H:%M")
    except Exception:
        local_date = session_ts[:16]

print(f"Session:  {session_id}")
print(f"Name:     {session_name or '(unnamed)'}")
print(f"Date:     {local_date}")
print(f"Project:  {cwd}")
print(f"Model:    {model or '(unknown)'}")
print()

# Opening request
print("═══ OPENING REQUEST ═══")
preview = first_user_msg[:500] if first_user_msg else "(no user messages)"
for line_text in preview.split("\n"):
    print(f"  {line_text}")
print()

# Files modified
if files_written:
    print(f"═══ FILES MODIFIED ({len(files_written)}) ═══")
    for path, action in files_written.items():
        print(f"  [{action:7s}] {path}")
    print()

# Significant commands (deduplicated, skip trivial ones)
TRIVIAL_CMDS = {"ls", "pwd", "cd", "echo", "cat", "head", "tail", "wc"}
significant_cmds = []
seen_cmds = set()
for cmd in commands_run:
    first_word = cmd.split()[0] if cmd.split() else ""
    base_cmd = os.path.basename(first_word)
    if base_cmd not in TRIVIAL_CMDS and cmd not in seen_cmds:
        significant_cmds.append(cmd)
        seen_cmds.add(cmd)

if significant_cmds:
    print(f"═══ KEY COMMANDS ({len(significant_cmds)}) ═══")
    for cmd in significant_cmds[:20]:
        print(f"  $ {cmd}")
    if len(significant_cmds) > 20:
        print(f"  ... and {len(significant_cmds) - 20} more")
    print()

# Decisions
# Deduplicate similar decisions
unique_decisions = []
seen = set()
for d in decisions:
    key = d[:60].lower()
    if key not in seen:
        seen.add(key)
        unique_decisions.append(d)

if unique_decisions:
    print(f"═══ DECISIONS & ACTIONS ({len(unique_decisions)}) ═══")
    for d in unique_decisions[:15]:
        print(f"  • {d}")
    if len(unique_decisions) > 15:
        print(f"  ... and {len(unique_decisions) - 15} more")
    print()

# Errors
if errors:
    print(f"═══ ERRORS ({len(errors)}) ═══")
    for tool_name, err in errors[:10]:
        print(f"  [{tool_name}] {err}")
    print()

# Final outcome
print("═══ FINAL RESPONSE ═══")
preview = last_assistant_text[:600] if last_assistant_text else "(no assistant response)"
for line_text in preview.split("\n"):
    print(f"  {line_text}")
print()

# Compaction summaries (if any)
if compaction_summaries:
    print(f"═══ COMPACTION SUMMARIES ({len(compaction_summaries)}) ═══")
    for cs in compaction_summaries:
        print(f"  {cs[:300]}")
        print()
