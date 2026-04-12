/**
 * Gondolin Sandbox Extension
 *
 * Toggle-able sandbox that redirects pi's built-in tools (read/write/edit/bash)
 * into a Gondolin micro-VM via event interception — no tool re-registration,
 * so it's compatible with pi-tool-display and other tool-overriding extensions.
 *
 * Usage:
 *   /sandbox          — toggle on/off
 *   /sandbox on       — enable
 *   /sandbox off      — disable
 *   /sandbox status   — show current state
 *
 * Prerequisites:
 *   - brew install qemu
 *   - npm install (in this extension directory)
 */

import path from "node:path";

import type {
  ExtensionAPI,
  ExtensionContext,
  ToolCallEvent,
  ToolResultEvent,
} from "@mariozechner/pi-coding-agent";

import { RealFSProvider, VM } from "@earendil-works/gondolin";

const GUEST_WORKSPACE = "/workspace";

const SANDBOXED_TOOLS = new Set(["bash", "read", "write", "edit"]);

// ── Path helpers ──────────────────────────────────────────────────────

function shQuote(value: string): string {
  return "'" + value.replace(/'/g, "'\\''") + "'";
}

function toGuestPath(localCwd: string, localPath: string): string {
  const rel = path.relative(localCwd, localPath);
  if (rel === "") return GUEST_WORKSPACE;
  if (rel.startsWith("..") || path.isAbsolute(rel)) {
    throw new Error(`path escapes workspace: ${localPath}`);
  }
  const posixRel = rel.split(path.sep).join(path.posix.sep);
  return path.posix.join(GUEST_WORKSPACE, posixRel);
}

function toHostPath(localCwd: string, guestPath: string): string {
  if (!guestPath.startsWith(GUEST_WORKSPACE)) return guestPath;
  const rel = guestPath.slice(GUEST_WORKSPACE.length).replace(/^\//, "");
  return rel ? path.join(localCwd, rel) : localCwd;
}

function sanitizeEnv(
  env?: NodeJS.ProcessEnv,
): Record<string, string> | undefined {
  if (!env) return undefined;
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(env)) {
    if (typeof v === "string") out[k] = v;
  }
  return out;
}

// ── Extension ─────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  const localCwd = process.cwd();

  let sandboxEnabled = false;
  let vm: VM | null = null;
  let vmStarting: Promise<VM> | null = null;

  async function ensureVm(ctx?: ExtensionContext): Promise<VM> {
    if (vm) return vm;
    if (vmStarting) return vmStarting;

    vmStarting = (async () => {
      ctx?.ui.setStatus(
        "gondolin",
        ctx.ui.theme.fg("accent", "🏔 Gondolin: starting…"),
      );

      const created = await VM.create({
        vfs: {
          mounts: {
            [GUEST_WORKSPACE]: new RealFSProvider(localCwd),
          },
        },
      });

      vm = created;
      ctx?.ui.setStatus(
        "gondolin",
        ctx.ui.theme.fg("accent", "🏔 Gondolin: active"),
      );
      ctx?.ui.notify(
        `Gondolin VM ready. ${localCwd} → ${GUEST_WORKSPACE}`,
        "info",
      );
      return created;
    })();

    return vmStarting;
  }

  async function stopVm(ctx?: ExtensionContext) {
    if (!vm) return;
    ctx?.ui.setStatus(
      "gondolin",
      ctx.ui.theme.fg("muted", "🏔 Gondolin: stopping…"),
    );
    try {
      await vm.close();
    } finally {
      vm = null;
      vmStarting = null;
      ctx?.ui.setStatus("gondolin", undefined);
    }
  }

  function updateStatus(ctx: ExtensionContext) {
    if (sandboxEnabled && vm) {
      ctx.ui.setStatus(
        "gondolin",
        ctx.ui.theme.fg("accent", "🏔 Gondolin: active"),
      );
    } else if (sandboxEnabled) {
      ctx.ui.setStatus(
        "gondolin",
        ctx.ui.theme.fg("warning", "🏔 Gondolin: starting…"),
      );
    } else {
      ctx.ui.setStatus("gondolin", undefined);
    }
  }

  // ── /sandbox command ──────────────────────────────────────────────

  pi.registerCommand("sandbox", {
    description: "Toggle Gondolin sandbox (on/off/status)",
    getArgumentCompletions: (prefix: string) => {
      const items = [
        { value: "on", label: "on" },
        { value: "off", label: "off" },
        { value: "status", label: "status" },
      ];
      const filtered = items.filter((i) => i.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
    handler: async (args, ctx) => {
      const arg = args?.trim().toLowerCase();

      if (arg === "status") {
        const state = sandboxEnabled
          ? vm
            ? "active"
            : "starting"
          : "off";
        ctx.ui.notify(`Gondolin sandbox: ${state}`, "info");
        return;
      }

      const enable =
        arg === "on" ? true : arg === "off" ? false : !sandboxEnabled;

      if (enable && !sandboxEnabled) {
        sandboxEnabled = true;
        ctx.ui.notify("Gondolin sandbox: enabling…", "info");
        await ensureVm(ctx);
        updateStatus(ctx);
      } else if (!enable && sandboxEnabled) {
        sandboxEnabled = false;
        await stopVm(ctx);
        ctx.ui.notify("Gondolin sandbox: disabled", "info");
        updateStatus(ctx);
      } else {
        ctx.ui.notify(
          `Gondolin sandbox already ${sandboxEnabled ? "on" : "off"}`,
          "info",
        );
      }
    },
  });

  // ── Event-based tool interception ─────────────────────────────────
  //
  // Instead of registerTool (which conflicts with pi-tool-display),
  // we use tool_call to rewrite paths host→guest before execution,
  // and user_bash to redirect ! commands.

  // Rewrite host paths → guest paths in tool_call args before execution
  pi.on("tool_call", async (event: ToolCallEvent, ctx) => {
    if (!sandboxEnabled || !SANDBOXED_TOOLS.has(event.toolName)) return;

    await ensureVm(ctx);

    if (event.toolName === "bash") {
      const input = event.input as { command: string; timeout?: number };
      // Rewrite any references to localCwd in the command
      input.command = input.command.replaceAll(localCwd, GUEST_WORKSPACE);
    } else if (
      event.toolName === "read" ||
      event.toolName === "write" ||
      event.toolName === "edit"
    ) {
      const input = event.input as { path: string };
      if (input.path) {
        const abs = path.isAbsolute(input.path)
          ? input.path
          : path.resolve(localCwd, input.path);
        input.path = toGuestPath(localCwd, abs);
      }
    }
  });

  // Redirect user `!` commands to VM
  pi.on("user_bash", async (_event, ctx) => {
    if (!sandboxEnabled || !vm) return;

    return {
      operations: {
        exec: async (
          command: string,
          cwd: string,
          {
            onData,
            signal,
            timeout,
            env,
          }: {
            onData: (data: string) => void;
            signal?: AbortSignal;
            timeout?: number;
            env?: NodeJS.ProcessEnv;
          },
        ) => {
          const guestCwd = toGuestPath(localCwd, cwd);
          const ac = new AbortController();
          const onAbort = () => ac.abort();
          signal?.addEventListener("abort", onAbort, { once: true });

          let timedOut = false;
          const timer =
            timeout && timeout > 0
              ? setTimeout(() => {
                  timedOut = true;
                  ac.abort();
                }, timeout * 1000)
              : undefined;

          try {
            const proc = vm!.exec(["/bin/bash", "-lc", command], {
              cwd: guestCwd,
              signal: ac.signal,
              env: sanitizeEnv(env),
              stdout: "pipe",
              stderr: "pipe",
            });
            for await (const chunk of proc.output()) {
              onData(chunk.data);
            }
            const r = await proc;
            return { exitCode: r.exitCode };
          } catch (err) {
            if (signal?.aborted) throw new Error("aborted");
            if (timedOut) throw new Error(`timeout:${timeout}`);
            throw err;
          } finally {
            if (timer) clearTimeout(timer);
            signal?.removeEventListener("abort", onAbort);
          }
        },
      },
    };
  });

  // Patch system prompt CWD when sandbox is active
  pi.on("before_agent_start", async (event, ctx) => {
    if (!sandboxEnabled) return;
    await ensureVm(ctx);
    const modified = event.systemPrompt.replace(
      `Current working directory: ${localCwd}`,
      `Current working directory: ${GUEST_WORKSPACE} (Gondolin sandbox, host: ${localCwd})`,
    );
    return { systemPrompt: modified };
  });

  // Clean up VM on session shutdown
  pi.on("session_shutdown", async (_event, ctx) => {
    await stopVm(ctx);
  });

  // Persist sandbox state across turns
  pi.on("turn_start", async () => {
    pi.appendEntry("gondolin-sandbox-state", { enabled: sandboxEnabled });
  });

  // Restore state on session resume
  pi.on("session_start", async (_event, ctx) => {
    const entries = ctx.sessionManager.getEntries();
    const stateEntry = entries
      .filter(
        (e: { type: string; customType?: string }) =>
          e.type === "custom" && e.customType === "gondolin-sandbox-state",
      )
      .pop() as { data?: { enabled: boolean } } | undefined;

    if (stateEntry?.data?.enabled) {
      sandboxEnabled = true;
      await ensureVm(ctx);
      updateStatus(ctx);
    }
  });
}
