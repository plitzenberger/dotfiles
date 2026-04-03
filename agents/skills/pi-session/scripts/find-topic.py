#!/usr/bin/env python3
"""Find sessions about a topic, optionally scoped to a folder.

Usage: python3 find-topic.py <topic> [sessions-folder]

If sessions-folder is omitted, searches ALL projects under ~/.pi/agent/sessions/.
Searches session_info.name, user messages, and assistant text content.
Results sorted by date (newest first) with stats summary per match.

Examples:
    python3 find-topic.py "auth refactor"
    python3 find-topic.py "docker" ~/.pi/agent/sessions/--Users-litzi-myproject--/
    python3 find-topic.py "NixOS flake" /path/to/specific/folder
"""
import json
import os
import sys
from datetime import datetime, timezone

if len(sys.argv) < 2:
    print("Usage: python3 find-topic.py <topic> [sessions-folder]", file=sys.stderr)
    print("  topic           — space-separated keywords (all must match)", file=sys.stderr)
    print("  sessions-folder — optional; defaults to all projects", file=sys.stderr)
    sys.exit(1)

keywords = sys.argv[1].lower().split()
base_dir = sys.argv[2] if len(sys.argv) > 2 else os.path.expanduser("~/.pi/agent/sessions")

if not os.path.isdir(base_dir):
    print(f"Error: {base_dir} is not a directory", file=sys.stderr)
    sys.exit(1)


def collect_jsonl_files(root):
    """Collect all .jsonl files, handling both direct folder and parent-of-folders."""
    files = []
    for dirpath, _, filenames in os.walk(root):
        for f in filenames:
            if f.endswith(".jsonl"):
                files.append(os.path.join(dirpath, f))
    return files


def extract_text(content):
    """Extract plain text from message content (string or block list)."""
    if isinstance(content, str):
        return content
    if isinstance(content, list):
        return " ".join(
            c.get("text", "") or c.get("thinking", "")
            for c in content
            if isinstance(c, dict) and c.get("type") in ("text", "thinking")
        )
    return ""


def scan_session(filepath):
    """Scan a session file for keyword matches. Returns match info or None."""
    matched_kw = set()
    session_id = ""
    session_name = ""
    session_ts = ""
    cwd = ""
    model = ""
    user_msgs = 0
    assistant_msgs = 0
    tool_calls = 0
    matched_snippets = []  # (role, snippet) of first matches

    try:
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
                    name_lower = session_name.lower()
                    for kw in keywords:
                        if kw in name_lower:
                            matched_kw.add(kw)

                elif etype == "model_change":
                    model = entry.get("modelId", "")

                elif etype == "message":
                    msg = entry.get("message", {})
                    role = msg.get("role", "")

                    if role == "user":
                        user_msgs += 1
                    elif role == "assistant":
                        assistant_msgs += 1
                        # Pick up model from assistant message if not from model_change
                        if not model and msg.get("model"):
                            model = msg["model"]
                        content = msg.get("content", [])
                        if isinstance(content, list):
                            tool_calls += sum(
                                1 for c in content
                                if isinstance(c, dict)
                                and c.get("type") in ("toolCall", "tool_use")
                            )

                    if role in ("user", "assistant"):
                        text = extract_text(msg.get("content", ""))
                        text_lower = text.lower()
                        for kw in keywords:
                            if kw in text_lower and kw not in matched_kw:
                                matched_kw.add(kw)
                                # Capture snippet around first occurrence
                                idx = text_lower.index(kw)
                                start = max(0, idx - 40)
                                end = min(len(text), idx + len(kw) + 40)
                                snippet = text[start:end].replace("\n", " ").strip()
                                matched_snippets.append((role, snippet))

                # Early exit once all keywords found and we have basic stats
                if len(matched_kw) == len(keywords) and user_msgs > 0:
                    # Continue counting but stop keyword scanning
                    pass

    except Exception as e:
        print(f"ERROR: {filepath}: {e}", file=sys.stderr)
        return None

    if len(matched_kw) < len(keywords):
        return None

    # Parse date for sorting
    local_date = ""
    if session_ts:
        try:
            utc_dt = datetime.fromisoformat(session_ts.replace("Z", "+00:00"))
            local_dt = utc_dt.astimezone()
            local_date = local_dt.strftime("%Y-%m-%d %H:%M")
        except Exception:
            local_date = session_ts[:16]

    return {
        "file": filepath,
        "id": session_id,
        "name": session_name,
        "date": local_date,
        "ts": session_ts,
        "cwd": cwd,
        "model": model,
        "user_msgs": user_msgs,
        "assistant_msgs": assistant_msgs,
        "tool_calls": tool_calls,
        "snippets": matched_snippets[:3],  # Max 3 snippets
    }


# Collect and scan
files = collect_jsonl_files(base_dir)
if not files:
    print(f"No .jsonl files found in {base_dir}", file=sys.stderr)
    sys.exit(1)

matches = []
for f in files:
    result = scan_session(f)
    if result:
        matches.append(result)

# Sort newest first
matches.sort(key=lambda m: m["ts"], reverse=True)

if not matches:
    print(f"No sessions found matching: {' '.join(keywords)}")
    print(f"Searched {len(files)} session files in {base_dir}")
    sys.exit(0)

print(f"Found {len(matches)} session(s) matching: {' '.join(keywords)}")
print(f"(searched {len(files)} files)")
print()

for i, m in enumerate(matches, 1):
    print(f"{'─' * 72}")
    print(f"  #{i}  {m['date']}  {m['name'] or '(unnamed)'}")
    print(f"  ID:     {m['id']}")
    print(f"  CWD:    {m['cwd']}")
    print(f"  Model:  {m['model'] or '(unknown)'}")
    print(f"  Stats:  {m['user_msgs']} user / {m['assistant_msgs']} assistant msgs, {m['tool_calls']} tool calls")
    print(f"  File:   {m['file']}")
    if m["snippets"]:
        print(f"  Context:")
        for role, snippet in m["snippets"]:
            print(f"    [{role}] ...{snippet}...")
    print()
