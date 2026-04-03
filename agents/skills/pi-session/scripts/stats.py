#!/usr/bin/env python3
"""Extract all metadata from a pi session JSONL file.

Usage: python3 stats.py <session-file>

Output: Key-value pairs for frontmatter population.
Handles missing data gracefully — prints empty values, never errors.
"""
import json
import sys
from datetime import datetime, timezone

if len(sys.argv) < 2:
    print("Usage: python3 stats.py <session-file>", file=sys.stderr)
    sys.exit(1)

file = sys.argv[1]

# Accumulators
session_id = ""
session_timestamp = ""
session_cwd = ""
session_name = ""
session_version = 1
model_id = ""
provider = ""
thinking_level = ""
user_count = 0
assistant_count = 0
tool_call_count = 0
tool_result_count = 0
bash_count = 0
last_usage_legacy = None  # Legacy top-level usage entry
cumulative_tokens = 0
cumulative_cost = 0.0
has_inline_usage = False  # v3 usage embedded in assistant messages
last_message_ts = ""

with open(file) as f:
    for line in f:
        entry = json.loads(line)
        entry_type = entry.get("type", "")

        if entry_type == "session":
            session_id = entry.get("id", "")
            session_timestamp = entry.get("timestamp", "")
            session_cwd = entry.get("cwd", "")
            session_version = entry.get("version", 1)

        elif entry_type == "session_info":
            session_name = entry.get("name", "")

        elif entry_type == "model_change":
            # Take the last model_change (user may switch models mid-session)
            model_id = entry.get("modelId", "")
            provider = entry.get("provider", "")

        elif entry_type == "thinking_level_change":
            thinking_level = entry.get("thinkingLevel", "")

        elif entry_type == "usage":
            # Legacy format: top-level usage entry
            last_usage_legacy = entry

        elif entry_type == "message":
            # Entry-level timestamp (ISO string on the entry itself)
            entry_ts = entry.get("timestamp", "")
            if entry_ts:
                last_message_ts = entry_ts

            msg = entry.get("message", {})
            role = msg.get("role", "")

            # Message-level timestamp (Unix ms on the message)
            msg_ts = msg.get("timestamp")
            if msg_ts and isinstance(msg_ts, (int, float)):
                # Convert Unix ms to ISO for comparison
                try:
                    ts_iso = datetime.fromtimestamp(
                        msg_ts / 1000, tz=timezone.utc
                    ).isoformat()
                    if ts_iso > last_message_ts:
                        last_message_ts = ts_iso
                except Exception:
                    pass

            if role == "user":
                user_count += 1
            elif role == "assistant":
                assistant_count += 1
                content = msg.get("content", [])
                if isinstance(content, list):
                    tool_call_count += sum(
                        1
                        for c in content
                        if isinstance(c, dict)
                        and c.get("type") in ("toolCall", "tool_use")
                    )
                # v3: usage embedded in assistant message
                usage = msg.get("usage")
                if usage and isinstance(usage, dict):
                    has_inline_usage = True
                    cumulative_tokens += usage.get("totalTokens", 0)
                    cost = usage.get("cost", {})
                    if isinstance(cost, dict):
                        cumulative_cost += cost.get("total", 0)
                # v3: model/provider directly on assistant message
                if not model_id and msg.get("model"):
                    model_id = msg.get("model", "")
                    provider = msg.get("provider", "")
            elif role == "toolResult":
                tool_result_count += 1
            elif role == "bashExecution":
                bash_count += 1

# Derive local start time from UTC timestamp
local_start = ""
if session_timestamp:
    try:
        utc_dt = datetime.fromisoformat(session_timestamp.replace("Z", "+00:00"))
        local_dt = utc_dt.astimezone()
        local_start = local_dt.strftime("%Y-%m-%dT%H:%M")
    except Exception:
        local_start = session_timestamp

# Derive local end time from last message timestamp
local_end = ""
if last_message_ts:
    try:
        utc_dt = datetime.fromisoformat(last_message_ts.replace("Z", "+00:00"))
        local_dt = utc_dt.astimezone()
        local_end = local_dt.strftime("%Y-%m-%dT%H:%M")
    except Exception:
        local_end = last_message_ts

# Usage / cost stats — prefer v3 inline usage, fall back to legacy
total_tokens = ""
total_cost = ""
if has_inline_usage:
    total_tokens = cumulative_tokens
    total_cost = round(cumulative_cost, 4) if cumulative_cost else ""
elif last_usage_legacy:
    token_keys = [
        "inputTokens",
        "outputTokens",
        "cacheReadInputTokens",
        "cacheCreationInputTokens",
    ]
    total_tokens = sum(last_usage_legacy.get(k, 0) for k in token_keys)
    total_cost = last_usage_legacy.get("totalCost", "")

total_messages = user_count + assistant_count

# Output
print(f"pi-session:     {session_id}")
print(f"version:        {session_version}")
print(f"name:           {session_name}")
print(f"cwd:            {session_cwd}")
print(f"started-utc:    {session_timestamp}")
print(f"start-local:    {local_start}")
print(f"end-local:      {local_end}")
print(f"pi-model:       {model_id}")
print(f"provider:       {provider}")
print(f"thinking:       {thinking_level}")
print(f"pi-messages:    {total_messages}")
print(f"user-msgs:      {user_count}")
print(f"assistant-msgs: {assistant_count}")
print(f"pi-tools:       {tool_call_count}")
print(f"tool-results:   {tool_result_count}")
print(f"bash-cmds:      {bash_count}")
print(f"pi-tokens:      {total_tokens}")
print(f"pi-cost:        {total_cost}")
