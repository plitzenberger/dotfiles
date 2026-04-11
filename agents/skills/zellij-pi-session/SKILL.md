---
name: zellij-pi-session
description: |
  Launch and manage pi coding agent sessions in Zellij tabs. Use when the user
  asks to: start a pi session in a new tab, send a prompt to another tab, open
  a session for a task, spawn a parallel agent, or manage pi across Zellij tabs.
  Also trigger on: new tab for this task, start a session, kickstart prompt,
  send this to the other tab, zellij pi, parallel session.
  Do NOT use for general Zellij config/keybindings (use zellij skill) or for
  pi extension development.
---

# Zellij Pi Session Management

Launch pi sessions in dedicated Zellij tabs and send kickstart prompts to them.

## Prerequisites

- Must be running inside a Zellij session (`$ZELLIJ_SESSION_NAME` set)
- Pi must be installed globally (`pi` on PATH)

## Core Pattern: Launch Session with Kickstart Prompt

```bash
# 1. Create named tab
zellij action new-tab --name "<Tab Name>"

# 2. Start pi (writes to the newly focused pane)
zellij action write-chars 'pi'
zellij action write 10

# 3. Wait for pi to boot
sleep 5

# 4. Send kickstart prompt
zellij action write-chars '<prompt text>'
zellij action write 10

# 5. Return to original tab
zellij action go-to-tab-name "<Original Tab>"
```

`zellij action write 10` sends Enter (byte 10 = newline).

## Send Prompt to Existing Tab

```bash
zellij action go-to-tab-name "<Target Tab>"
zellij action write-chars '<prompt text>'
zellij action write 10
zellij action go-to-tab-name "<Original Tab>"
```

Only works when the target tab's pi session is idle (waiting for input).

## Rules

1. **Always name tabs** — use the task/epic name for traceability.
2. **Always return** — switch back to the originating tab after sending.
3. **Sleep 5s after `pi` start** — pi needs time to boot before accepting input.
4. **Single quotes for `write-chars`** — prevents shell expansion of prompt content.
5. **No `-p` flag** — use interactive mode so the session persists.
6. **One prompt per send** — don't chain multiple prompts without waiting.
7. **Check Zellij context** — verify `$ZELLIJ_SESSION_NAME` before attempting tab operations.

## Kickstart Prompts

A kickstart prompt bootstraps a fresh pi session with full context. Structure:

```
I'm working on <task name>.

Read these files for full context:
1. <task note path> (full design)
2. <parent project path> (project context)
3. <any existing implementation files>

Key references:
- <relevant docs or examples>

Goal: <one-sentence objective>. Follow the design in the task note.
```

Source kickstart prompts from task notes (`## Session Kickstart` section).

## Reference

For tab listing, renaming, and advanced Zellij operations, see [references/zellij-tab-ops.md](references/zellij-tab-ops.md).
