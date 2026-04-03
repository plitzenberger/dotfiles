#!/usr/bin/env python3
"""Summarize a session with emphasis on recent messages.

Usage: python3 summarize.py <session-file-or-uuid> [--first N] [--last N] [--all]

Defaults to showing the last 8 messages (user + assistant), giving higher
priority to recent context. Use --first to also include opening messages.

Options:
    --last N    Show last N user+assistant messages (default: 8)
    --first N   Also show first N user+assistant messages (default: 0)
    --all       Show all messages (overrides --first/--last)
    --full      Don't truncate message content (default: 500 chars)

If a partial UUID is given instead of a file path, searches ~/.pi/agent/sessions/.
"""
import json
import os
import sys
from datetime import datetime, timezone

# --- Argument parsing ---
args = sys.argv[1:]
if not args or args[0] in ("-h", "--help"):
    print(__doc__.strip())
    sys.exit(0)

target = args[0]
show_last = 8
show_first = 0
show_all = False
max_chars = 500

i = 1
while i < len(args):
    if args[i] == "--last" and i + 1 < len(args):
        show_last = int(args[i + 1]); i += 2
    elif args[i] == "--first" and i + 1 < len(args):
        show_first = int(args[i + 1]); i += 2
    elif args[i] == "--all":
        show_all = True; i += 1
    elif args[i] == "--full":
        max_chars = 0; i += 1
    else:
        print(f"Unknown option: {args[i]}", file=sys.stderr)
        sys.exit(1)


# --- Resolve file path ---
def find_by_uuid(partial_uuid):
    sessions_dir = os.path.expanduser("~/.pi/agent/sessions")
    for dirpath, _, filenames in os.walk(sessions_dir):
        for f in filenames:
            if partial_uuid in f and f.endswith(".jsonl"):
                return os.path.join(dirpath, f)
    return None


if os.path.isfile(target):
    filepath = target
else:
    filepath = find_by_uuid(target)
    if not filepath:
        print(f"Error: Could not find session file or UUID match for: {target}", file=sys.stderr)
        sys.exit(1)


# --- Extract text from content blocks ---
def extract_text(content):
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        parts = []
        for c in content:
            if not isinstance(c, dict):
                continue
            if c.get("type") == "text":
                parts.append(c.get("text", ""))
            elif c.get("type") == "thinking":
                parts.append(f"[thinking] {c.get('thinking', '')}")
            elif c.get("type") in ("toolCall", "tool_use"):
                name = c.get("name", "unknown")
                tool_args = c.get("arguments", {})
                # Show just the tool name and key args
                arg_preview = ""
                if isinstance(tool_args, dict):
                    for k in ("command", "path", "pattern", "query", "task"):
                        if k in tool_args:
                            v = str(tool_args[k])[:80]
                            arg_preview = f" {k}={v}"
                            break
                parts.append(f"[tool: {name}{arg_preview}]")
        return "\n".join(parts)
    return str(content)


# --- Parse session ---
session_id = ""
session_name = ""
session_ts = ""
cwd = ""
model = ""
messages = []  # (role, text, timestamp_str)

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
            summary = entry.get("summary", "")
            ts = entry.get("timestamp", "")
            messages.append(("compaction", summary, ts))

        elif etype == "message":
            msg = entry.get("message", {})
            role = msg.get("role", "")

            if not model and role == "assistant" and msg.get("model"):
                model = msg["model"]

            if role in ("user", "assistant"):
                text = extract_text(msg.get("content", ""))
                ts = entry.get("timestamp", "")
                messages.append((role, text, ts))


# --- Select messages to display ---
user_assistant = [(i, m) for i, m in enumerate(messages) if m[0] in ("user", "assistant", "compaction")]

if show_all:
    selected_indices = set(range(len(user_assistant)))
else:
    selected_indices = set()
    # First N
    for j in range(min(show_first, len(user_assistant))):
        selected_indices.add(j)
    # Last N
    total = len(user_assistant)
    for j in range(max(0, total - show_last), total):
        selected_indices.add(j)

selected = sorted(selected_indices)

# --- Format timestamp ---
def format_ts(ts_str):
    if not ts_str:
        return ""
    try:
        utc_dt = datetime.fromisoformat(ts_str.replace("Z", "+00:00"))
        local_dt = utc_dt.astimezone()
        return local_dt.strftime("%H:%M")
    except Exception:
        return ts_str[:5]

# --- Print header ---
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
print(f"Started:  {local_date}")
print(f"Project:  {cwd}")
print(f"Model:    {model or '(unknown)'}")
print(f"Messages: {len(user_assistant)} user+assistant ({len(messages)} total incl. compaction)")
print(f"Showing:  ", end="")
if show_all:
    print("all")
else:
    parts = []
    if show_first:
        parts.append(f"first {show_first}")
    parts.append(f"last {show_last}")
    print(" + ".join(parts))
print()

# --- Print selected messages ---
prev_idx = -1
for j in selected:
    if prev_idx >= 0 and j > prev_idx + 1:
        skipped = j - prev_idx - 1
        print(f"  ... ({skipped} messages skipped) ...")
        print()
    prev_idx = j

    orig_idx, (role, text, ts) = user_assistant[j]
    time_str = format_ts(ts)
    role_label = role.upper()

    if role == "compaction":
        print(f"{'═' * 60}")
        print(f"  COMPACTION SUMMARY ({time_str})")
        if max_chars and len(text) > max_chars:
            print(f"  {text[:max_chars]}...")
        else:
            print(f"  {text}")
        print(f"{'═' * 60}")
    else:
        marker = "▶" if role == "user" else "◀"
        print(f"  {marker} [{time_str}] {role_label}")
        display = text.strip()
        if max_chars and len(display) > max_chars:
            display = display[:max_chars] + "..."
        # Indent multiline content
        for line in display.split("\n"):
            print(f"    {line}")
    print()
