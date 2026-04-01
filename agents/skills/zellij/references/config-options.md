# Zellij Configuration Options Reference

All options are set at the root of `config.kdl` (or via `programs.zellij.settings` in home-manager).

Source: https://zellij.dev/documentation/options.html

## Core Options

| Option | Type | Default | Description |
|---|---|---|---|
| `on_force_close` | `"detach"` \| `"quit"` | `"detach"` | Behavior on SIGTERM/SIGINT/SIGQUIT/SIGHUP |
| `simplified_ui` | bool | `false` | Simplified UI without arrow fonts |
| `default_shell` | string | `$SHELL` | Default shell for new panes |
| `pane_frames` | bool | `true` | Show frames around panes |
| `theme` | string | `"default"` | Color theme name |
| `default_layout` | string | `"default"` | Layout to load on startup (`"default"`, `"compact"`, or custom) |
| `default_mode` | string | `"normal"` | Starting mode (commonly `"locked"` for unlock-first) |
| `mouse_mode` | bool | `true` | Enable mouse support |
| `scroll_buffer_size` | int | `10000` | Scrollback buffer lines per pane |
| `auto_layout` | bool | `true` | Auto-arrange panes using swap layouts |
| `styled_underlines` | bool | `true` | Extended underline ANSI support |
| `stacked_resize` | bool | `true` | Stack panes when resizing non-directionally |

## Copy/Clipboard

| Option | Type | Default | Description |
|---|---|---|---|
| `copy_command` | string | none | External copy command (e.g., `"pbcopy"`, `"wl-copy"`, `"xclip -selection clipboard"`) |
| `copy_clipboard` | `"system"` \| `"primary"` | `"system"` | Clipboard target (X11/Wayland primary vs system) |
| `copy_on_select` | bool | `true` | Auto-copy on mouse selection release |
| `scrollback_editor` | string | `$EDITOR` | Editor for scrollback editing (`Ctrl+s` then `e`) |

## Mouse Options (≥ 0.44.0)

| Option | Type | Default | Description |
|---|---|---|---|
| `advanced_mouse_actions` | bool | `true` | Drag-to-resize, multi-select, hover effects |
| `mouse_hover_effects` | bool | `true` | Pane frame highlight and help text on hover |
| `focus_follows_mouse` | bool | `false` | Auto-focus pane on hover |
| `mouse_click_through` | bool | `false` | First click sends event to pane (not just focus) |

## Session Persistence

| Option | Type | Default | Description |
|---|---|---|---|
| `session_serialization` | bool | `true` | Serialize sessions for resurrection |
| `pane_viewport_serialization` | bool | `false` | Also serialize visible pane viewport |
| `scrollback_lines_to_serialize` | int | none | `0` = all, or N lines per pane |
| `serialization_interval` | int (seconds) | none | How often to serialize |
| `disable_session_metadata` | bool | `false` | Disable session metadata writing |

## UI Customization

| Option | Type | Default | Description |
|---|---|---|---|
| `show_startup_tips` | bool | `true` | Show tips on startup |
| `show_release_notes` | bool | `true` | Show release notes on first run of new version |
| `visual_bell` | bool | `true` | Flash pane/tab frame on bell character |

Nested UI config:
```kdl
ui {
    pane_frames {
        rounded_corners true
        hide_session_name true
    }
}
```

## Web Server / Client (≥ 0.44.0)

| Option | Type | Default | Description |
|---|---|---|---|
| `web_server` | bool | `false` | Start built-in web server |
| `web_server_ip` | string | `"127.0.0.1"` | Listen IP |
| `web_server_port` | int | `8082` | Listen port |
| `web_server_cert` | string | none | SSL certificate path |
| `web_server_key` | string | none | SSL private key path |
| `enforce_https_on_localhost` | bool | false | Force HTTPS on localhost |
| `web_sharing` | `"on"` \| `"off"` \| `"disabled"` | `"off"` | Whether new sessions are shared via web |

## Other

| Option | Type | Default | Description |
|---|---|---|---|
| `mirror_session` | bool | `false` | Mirror session for multi-user (vs independent cursors) |
| `layout_dir` | string | none | Custom layouts directory |
| `theme_dir` | string | none | Custom themes directory |
| `default_cwd` | string | none | Default CWD for new panes |
| `osc8_hyperlinks` | bool | `false` | Clickable OSC8 hyperlinks |
| `session_name` | string | random | Named session on start |
| `attach_to_session` | bool | `false` | Attach to existing session with same name |
| `support_kitty_keyboard_protocol` | bool | auto | Kitty keyboard protocol support |
| `env` | key-value map | none | Environment variables for panes |

### Environment Variables Example

```kdl
env {
    RUST_BACKTRACE 1
    FOO "bar"
}
```
