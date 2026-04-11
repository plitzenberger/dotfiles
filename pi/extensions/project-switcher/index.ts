/**
 * Project Switcher Extension (Zellij-based)
 *
 * Switch project context from within pi by managing Zellij sessions.
 * Lists active Zellij sessions and lets you switch to one, or create
 * a new session rooted in a project directory.
 *
 * Usage:
 *   /project              — open session selector
 *   /project <name>       — switch directly to named session
 *   Ctrl+Shift+J          — open selector (mnemonic: Jump)
 *
 * Prerequisites:
 *   - Zellij must be running (pi should be inside a Zellij session)
 *   - Project directories are discovered from ~/Projects, ~/Documents,
 *     or configured via PROJECTS_ROOT env var
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { DynamicBorder } from "@mariozechner/pi-coding-agent";
import { Container, Key, type SelectItem, SelectList, Text } from "@mariozechner/pi-tui";
import { execSync } from "node:child_process";
import { existsSync, readdirSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { homedir } from "node:os";

interface ZellijSession {
  name: string;
  active: boolean;
}

function getZellijSessions(): ZellijSession[] {
  try {
    const output = execSync("zellij list-sessions --short 2>/dev/null", {
      encoding: "utf-8",
      timeout: 3000,
    }).trim();
    if (!output) return [];
    return output.split("\n").map((line) => {
      const active = line.includes("(current)");
      const name = line.replace(/\s*\(current\)\s*/, "").trim();
      return { name, active };
    });
  } catch {
    return [];
  }
}

function isInsideZellij(): boolean {
  return !!process.env.ZELLIJ_SESSION_NAME;
}

function switchToSession(sessionName: string): boolean {
  try {
    execSync(`zellij action switch-session "${sessionName}" 2>/dev/null`, {
      timeout: 3000,
    });
    return true;
  } catch {
    return false;
  }
}

function createAndAttachSession(name: string, cwd: string): boolean {
  try {
    // Create session in background, then switch to it
    execSync(
      `zellij --session "${name}" --new-session-with-layout default options --default-cwd "${cwd}" &`,
      { timeout: 5000, shell: "/bin/bash" }
    );
    // Give it a moment to start
    execSync("sleep 0.5");
    return switchToSession(name);
  } catch {
    return false;
  }
}

function getProjectDirs(): { name: string; path: string }[] {
  const roots = [
    process.env.PROJECTS_ROOT,
    join(homedir(), "Projects"),
    join(homedir(), "Documents"),
    join(homedir(), "Code"),
    join(homedir(), "repos"),
    join(homedir(), "src"),
  ].filter((r): r is string => !!r && existsSync(r));

  const projects: { name: string; path: string }[] = [];
  const seen = new Set<string>();

  for (const root of roots) {
    try {
      const entries = readdirSync(root, { withFileTypes: true });
      for (const entry of entries) {
        if (!entry.isDirectory() || entry.name.startsWith(".")) continue;
        const fullPath = join(root, entry.name);
        // Check if it looks like a project (has .git, package.json, etc.)
        const isProject =
          existsSync(join(fullPath, ".git")) ||
          existsSync(join(fullPath, "package.json")) ||
          existsSync(join(fullPath, "Cargo.toml")) ||
          existsSync(join(fullPath, "go.mod")) ||
          existsSync(join(fullPath, ".obsidian")) ||
          existsSync(join(fullPath, "AGENTS.md"));

        if (isProject && !seen.has(entry.name)) {
          seen.add(entry.name);
          projects.push({ name: entry.name, path: fullPath });
        }
      }
    } catch {
      // skip unreadable dirs
    }
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name));
}

export default function (pi: ExtensionAPI) {
  async function showSelector(ctx: ExtensionContext): Promise<void> {
    if (!isInsideZellij()) {
      ctx.ui.notify(
        "Not inside a Zellij session. Start pi inside Zellij to use project switching.",
        "warning"
      );
      return;
    }

    const sessions = getZellijSessions();
    const currentSession = process.env.ZELLIJ_SESSION_NAME;
    const projects = getProjectDirs();

    // Build items: active sessions first, then available projects
    const items: SelectItem[] = [];

    // Active sessions
    for (const s of sessions) {
      if (s.name === currentSession) continue; // skip current
      items.push({
        value: `session:${s.name}`,
        label: `⚡ ${s.name}`,
        description: "Active session — switch to it",
      });
    }

    // Projects not yet having a session
    const sessionNames = new Set(sessions.map((s) => s.name));
    for (const p of projects) {
      if (sessionNames.has(p.name)) continue;
      items.push({
        value: `project:${p.name}:${p.path}`,
        label: `📁 ${p.name}`,
        description: p.path.replace(homedir(), "~"),
      });
    }

    if (items.length === 0) {
      ctx.ui.notify("No other sessions or projects found.", "info");
      return;
    }

    const result = await ctx.ui.custom<string | null>(
      (tui, theme, _kb, done) => {
        const container = new Container();
        container.addChild(
          new DynamicBorder((str) => theme.fg("accent", str))
        );
        container.addChild(
          new Text(
            theme.fg("accent", theme.bold("Switch Project")) +
              theme.fg("muted", ` (current: ${currentSession})`)
          )
        );

        const selectList = new SelectList(
          items,
          Math.min(items.length, 15),
          {
            selectedPrefix: (text) => theme.fg("accent", text),
            selectedText: (text) => theme.fg("accent", text),
            description: (text) => theme.fg("muted", text),
            scrollInfo: (text) => theme.fg("dim", text),
            noMatch: (text) => theme.fg("warning", text),
          }
        );

        selectList.onSelect = (item) => done(item.value);
        selectList.onCancel = () => done(null);
        container.addChild(selectList);
        container.addChild(
          new Text(
            theme.fg(
              "dim",
              "⚡ = running session  📁 = new session from project • esc cancel"
            )
          )
        );
        container.addChild(
          new DynamicBorder((str) => theme.fg("accent", str))
        );

        return {
          render(width: number) {
            return container.render(width);
          },
          invalidate() {
            container.invalidate();
          },
          handleInput(data: string) {
            selectList.handleInput(data);
            tui.requestRender();
          },
        };
      }
    );

    if (!result) return;

    if (result.startsWith("session:")) {
      const name = result.slice("session:".length);
      if (switchToSession(name)) {
        ctx.ui.notify(`Switched to session: ${name}`, "info");
      } else {
        ctx.ui.notify(`Failed to switch to session: ${name}`, "error");
      }
    } else if (result.startsWith("project:")) {
      const parts = result.split(":");
      const name = parts[1];
      const path = parts.slice(2).join(":");
      ctx.ui.notify(`Creating session "${name}" at ${path}…`, "info");
      if (createAndAttachSession(name, path)) {
        ctx.ui.notify(`Switched to new session: ${name}`, "info");
      } else {
        ctx.ui.notify(`Failed to create session: ${name}`, "error");
      }
    }
  }

  // /project command
  pi.registerCommand("project", {
    description: "Switch project context via Zellij sessions",
    handler: async (args, ctx) => {
      if (args?.trim()) {
        const name = args.trim();
        if (!isInsideZellij()) {
          ctx.ui.notify("Not inside Zellij.", "warning");
          return;
        }
        if (switchToSession(name)) {
          ctx.ui.notify(`Switched to: ${name}`, "info");
        } else {
          ctx.ui.notify(
            `Session "${name}" not found. Use /project to see available.`,
            "error"
          );
        }
        return;
      }
      await showSelector(ctx);
    },
  });

  // Keyboard shortcut
  pi.registerShortcut(Key.ctrlShift("j"), {
    description: "Switch project (Zellij session)",
    handler: async (ctx) => {
      await showSelector(ctx);
    },
  });
}
