#!/usr/bin/env python3
"""Extract user messages from a pi session for content understanding.

Usage: python3 summary.py <session-file> [max-messages]

Prints session header info followed by user messages (truncated to 300 chars).
Default: first 10 user messages. Use 0 for all.
"""
import json
import sys

if len(sys.argv) < 2:
    print("Usage: python3 summary.py <session-file> [max-messages]", file=sys.stderr)
    sys.exit(1)

file = sys.argv[1]
max_msgs = int(sys.argv[2]) if len(sys.argv) > 2 else 10

with open(file) as fh:
    header = json.loads(fh.readline())
    print(f"ID:      {header.get('id', '')}")
    print(f"Started: {header.get('timestamp', '')}")

    # Look for session_info (name) in next few lines
    pos = fh.tell()
    for _ in range(5):
        line = fh.readline()
        if not line:
            break
        entry = json.loads(line)
        if entry.get("type") == "session_info":
            print(f"Name:    {entry.get('name', '')}")
            break
    fh.seek(pos)

    print()
    count = 0
    for line in fh:
        entry = json.loads(line)
        if entry.get("type") != "message":
            continue
        msg = entry.get("message", {})
        if msg.get("role") != "user":
            continue

        content = msg.get("content", "")
        if isinstance(content, list):
            content = " ".join(
                c.get("text", "")
                for c in content
                if isinstance(c, dict) and c.get("type") == "text"
            )
        content = content.strip()
        if not content:
            continue

        count += 1
        print(f"--- User msg {count} ---")
        print(content[:300])
        print()

        if max_msgs and count >= max_msgs:
            break

    if count == 0:
        print("(no user messages found)")
