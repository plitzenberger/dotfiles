#!/usr/bin/env python3
"""Search sessions by topic keywords across a folder.

Usage: python3 search.py <sessions-folder> <keyword1> [keyword2] ...

Searches user AND assistant text content for any of the keywords (case-insensitive).
Prints matching session filenames with the matched keyword.
"""
import json
import os
import sys

if len(sys.argv) < 3:
    print(
        "Usage: python3 search.py <sessions-folder> <keyword1> [keyword2] ...",
        file=sys.stderr,
    )
    sys.exit(1)

folder = sys.argv[1]
keywords = [k.lower() for k in sys.argv[2:]]

if not os.path.isdir(folder):
    print(f"Error: {folder} is not a directory", file=sys.stderr)
    sys.exit(1)

files = sorted(f for f in os.listdir(folder) if f.endswith(".jsonl"))

for fname in files:
    filepath = os.path.join(folder, fname)
    matched_keywords = set()

    try:
        with open(filepath) as fh:
            for line in fh:
                entry = json.loads(line)

                # Check session_info name
                if entry.get("type") == "session_info":
                    name = entry.get("name", "").lower()
                    for kw in keywords:
                        if kw in name:
                            matched_keywords.add(kw)

                # Check message content
                if entry.get("type") != "message":
                    continue
                msg = entry.get("message", {})
                role = msg.get("role", "")
                if role not in ("user", "assistant"):
                    continue

                content = msg.get("content", "")
                if isinstance(content, list):
                    content = " ".join(
                        c.get("text", "")
                        for c in content
                        if isinstance(c, dict) and c.get("type") == "text"
                    )
                content_lower = content.lower()

                for kw in keywords:
                    if kw in content_lower:
                        matched_keywords.add(kw)

                # Early exit if all keywords found
                if len(matched_keywords) == len(keywords):
                    break

        if matched_keywords:
            print(f"MATCH ({', '.join(sorted(matched_keywords))}): {fname}")

    except Exception as e:
        print(f"ERROR: {fname}: {e}", file=sys.stderr)
