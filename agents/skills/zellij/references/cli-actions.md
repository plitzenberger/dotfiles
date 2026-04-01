# Zellij CLI Actions & Scripting Reference

Source: https://zellij.dev/documentation/cli-actions.html

## Session Management

```bash
zellij                              # Start new session
zellij -s my-session                # Start named session
zellij -l compact                   # Start with layout
zellij -l welcome                   # Start with welcome screen
zellij attach my-session            # Attach to session
zellij attach --create my-session   # Attach or create
zellij attach --create-background   # Create headless session
zellij list-sessions                # List sessions
zellij kill-session my-session      # Kill specific session
zellij kill-all-sessions            # Kill all sessions
zellij delete-session my-session    # Delete (exited) session
zellij delete-all-sessions          # Delete all exited sessions
```

## Pane Actions

```bash
# New panes
zellij action new-pane                           # New pane (auto-direction)
zellij action new-pane --direction down           # Split down
zellij action new-pane --direction right          # Split right
zellij action new-pane --floating                 # New floating pane
zellij action new-pane --name "build" -- make     # Command pane

# Blocking panes (for scripts)
zellij action new-pane --block-until-exit -- cmd        # Block until cmd exits
zellij action new-pane --block-until-exit-success -- cmd # Block until success (retry on fail)
zellij action new-pane --block-until-exit-failure -- cmd # Block until failure

# Focus and navigation
zellij action move-focus left|right|up|down
zellij action move-focus-or-tab left|right
zellij action focus-next-pane
zellij action focus-previous-pane

# Pane manipulation
zellij action close-pane
zellij action toggle-fullscreen
zellij action toggle-floating-panes
zellij action toggle-pane-embed-or-floating
zellij action toggle-pane-frames
zellij action toggle-pane-pinned
zellij action rename-pane "my-pane"
zellij action undo-rename-pane

# Resize
zellij action resize increase|decrease
zellij action resize increase left|right|up|down

# Move
zellij action move-pane
zellij action move-pane left|right|up|down
```

## Tab Actions

```bash
zellij action new-tab
zellij action new-tab --layout my-layout
zellij action new-tab --name "editor"
zellij action close-tab
zellij action go-to-tab 1                # Go to tab by index
zellij action go-to-next-tab
zellij action go-to-previous-tab
zellij action toggle-tab                 # Toggle last active tab
zellij action move-tab left|right        # Reorder tab
zellij action rename-tab "my-tab"
zellij action undo-rename-tab
zellij action toggle-active-sync-tab     # Sync input to all panes in tab
zellij action break-pane                 # Break pane to new tab
zellij action break-pane-left            # Break pane to left tab
zellij action break-pane-right           # Break pane to right tab
```

## Scrollback

```bash
zellij action scroll-down
zellij action scroll-up
zellij action page-scroll-down
zellij action page-scroll-up
zellij action half-page-scroll-down
zellij action half-page-scroll-up
zellij action scroll-to-bottom
zellij action scroll-to-top
zellij action edit-scrollback            # Open in $EDITOR
```

## Session Actions

```bash
zellij action detach
zellij action switch-mode normal|locked|pane|tab|resize|move|scroll|session
zellij action dump-layout                # Print current layout
zellij action dump-screen /path/to/file  # Dump pane contents
```

## Querying State (JSON)

```bash
zellij action list-panes --json          # All panes with IDs, titles, exit codes
zellij action list-tabs --json           # All tabs
zellij action current-tab-info --json    # Current tab details
```

## Run & Edit

```bash
# Run command in new pane
zellij run -- cargo build
zellij run --direction down -- cargo test
zellij run --floating -- htop
zellij run --name "tests" -- cargo test
zellij run --start-suspended -- make deploy  # Start suspended, Enter to run

# Edit file in new pane
zellij edit /path/to/file
zellij edit --floating /path/to/file
zellij edit --direction down /path/to/file
```

## Plugins & Pipes

```bash
# Launch plugin
zellij plugin -- zellij:session-manager
zellij plugin --floating -- zellij:strider

# Pipe data to/from plugins
zellij pipe --plugin zellij:session-manager -- "message"
```

## Subscribe (Live Output Streaming)

```bash
# Stream pane output in real-time
zellij subscribe --pane-id terminal_1
zellij subscribe --pane-id terminal_1 --json  # JSON formatted
```

## Scripting Patterns

### CI-like Pipeline with Retry

```bash
zellij action new-pane --block-until-exit-success --name "test" -- make test
zellij action new-pane --block-until-exit-success --name "build" -- make build
zellij action new-pane --block-until-exit --name "deploy" -- ./deploy.sh
```

### Capture Pane ID for Targeting

```bash
PANE_ID=$(zellij action new-pane --direction down)
zellij action write-chars --pane-id "$PANE_ID" "echo hello"
```

### Background Session Automation

```bash
zellij attach --create-background my-automation
zellij -s my-automation action new-pane -- ./long-task.sh
zellij -s my-automation action list-panes --json
```
