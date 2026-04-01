# Zellij NixOS / Home-Manager Integration Reference

## Home-Manager Module

The `programs.zellij` module generates `~/.config/zellij/config.kdl` from a Nix attrset using the `lib.hm.generators.toKDL` serializer.

Source: https://github.com/nix-community/home-manager/blob/master/modules/programs/zellij.nix

### Basic Configuration

```nix
programs.zellij = {
  enable = true;

  # Freeform attrset → serialized to KDL
  settings = {
    default_shell = "zsh";
    default_layout = "compact";
    pane_frames = true;
    mouse_mode = true;
    copy_on_select = true;
    copy_clipboard = "system";
    scroll_buffer_size = 10000;

    # Nested KDL blocks use nested attrsets
    ui.pane_frames = {
      rounded_corners = true;
      hide_session_name = true;
    };
  };

  # Raw KDL appended after settings (for complex blocks)
  extraConfig = ''
    keybinds {
      normal {
        bind "Ctrl g" { SwitchToMode "locked"; }
      }
    }
  '';
};
```

### Available Module Options

| Option | Type | Description |
|---|---|---|
| `enable` | bool | Enable zellij |
| `package` | package | Zellij package to install |
| `settings` | attrset | Config options (→ `config.kdl`) |
| `extraConfig` | string | Raw KDL appended to config |
| `layouts` | attrset | Layout files (→ `layouts/<name>.kdl`) |
| `themes` | attrset | Theme files (→ `themes/<name>.kdl`) |
| `enableBashIntegration` | bool | Auto-start in bash |
| `enableZshIntegration` | bool | Auto-start in zsh |
| `enableFishIntegration` | bool | Auto-start in fish |
| `attachExistingSession` | bool | Attach to default session (needs shell integration) |
| `exitShellOnExit` | bool | Exit shell when zellij exits (needs shell integration) |

### Layouts via Home-Manager

Layouts can be defined as Nix attrsets (converted to KDL), raw strings, or paths:

```nix
programs.zellij.layouts = {
  # As raw KDL string
  dev = ''
    layout {
      default_tab_template {
        pane size=1 borderless=true {
          plugin location="zellij:compact-bar"
        }
        children
      }
      tab name="editor" {
        pane command="nvim"
      }
      tab name="shell" {
        pane
      }
    }
  '';

  # As a path to a .kdl file
  work = ./layouts/work.kdl;
};
```

### Keybindings via extraConfig

Complex keybinding blocks don't serialize well from Nix attrsets. Use `extraConfig`:

```nix
programs.zellij.extraConfig = ''
  keybinds clear-defaults=true {
    normal {
      bind "Ctrl p" { SwitchToMode "pane"; }
      bind "Ctrl t" { SwitchToMode "tab"; }
    }
    pane {
      bind "n" { NewPane; SwitchToMode "Normal"; }
      bind "x" { CloseFocus; SwitchToMode "Normal"; }
    }
  }
'';
```

### Catppuccin Theme Integration

When using catppuccin/nix:

```nix
catppuccin.zellij = {
  enable = true;
  flavor = "frappe";  # latte, frappe, macchiato, mocha
};
# The theme is set automatically in config.kdl
# Do NOT also set `settings.theme` — it will conflict
```

### Version Pinning via Overlay

When the stable nixpkgs branch doesn't have the needed zellij version:

```nix
# flake.nix inputs
nixpkgs-unstable.url = "github:nixos/nixpkgs/nixpkgs-unstable";

# overlays/default.nix
modifications = final: prev:
  let
    unstable = import inputs.nixpkgs-unstable {
      system = final.stdenv.hostPlatform.system;
    };
  in {
    zellij = unstable.zellij;
  };
```

### Common Pitfalls

| Issue | Cause | Solution |
|---|---|---|
| New config options ignored | Zellij version too old for the option | Check version, overlay from unstable if needed |
| `settings` doesn't support complex KDL | `toKDL` can't express all KDL patterns | Use `extraConfig` for keybinds, plugin blocks |
| Config not applied | Existing zellij session uses old config | `zellij kill-all-sessions` and restart |
| Theme conflict | Both catppuccin module and `settings.theme` set | Remove `settings.theme` when using catppuccin module |
| `darwin-rebuild` doesn't update zellij | Stable branch hasn't backported the version | Add `nixpkgs-unstable` input and overlay zellij |
