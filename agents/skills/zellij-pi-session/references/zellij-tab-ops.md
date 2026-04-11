# Zellij Tab Operations Reference

## Tab Management

```bash
# Create tab
zellij action new-tab --name "My Tab"

# Rename current tab
zellij action rename-tab "New Name"

# Switch to tab by name
zellij action go-to-tab-name "Tab Name"

# Switch to tab by index (1-based)
zellij action go-to-tab 3

# Close current tab
zellij action close-tab
```

## Writing to Panes

```bash
# Type characters into focused pane
zellij action write-chars 'hello world'

# Send raw bytes (10 = Enter, 27 = Escape, 3 = Ctrl+C)
zellij action write 10        # Enter
zellij action write 3         # Ctrl+C (interrupt)
zellij action write 27        # Escape

# Multi-line content (newlines in single quotes are literal)
zellij action write-chars 'line one
line two
line three'
```

## Querying State

```bash
# List sessions
zellij list-sessions --short

# Current session name
echo $ZELLIJ_SESSION_NAME

# Check if inside Zellij
test -n "$ZELLIJ_SESSION_NAME" && echo "inside zellij" || echo "not in zellij"
```

## Session Operations

```bash
# Switch session (different from tab switching)
zellij action switch-session "session-name"

# Create new session in background
zellij --session "name" --new-session-with-layout default &
```

## Common Patterns

### Interrupt and restart pi in a tab

```bash
zellij action go-to-tab-name "Target"
zellij action write 27        # Escape (cancel streaming)
sleep 1
zellij action write 3         # Ctrl+C (clear editor)
zellij action write-chars 'new prompt here'
zellij action write 10
zellij action go-to-tab-name "Origin"
```

### Check if pi is ready (heuristic)

No reliable way to query pane content. The 5-second sleep after `pi` start is a practical heuristic. For slower machines, increase to 8-10 seconds.
