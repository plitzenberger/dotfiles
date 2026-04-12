/**
 * Gondolin Sandbox Extension
 *
 * Toggle-able sandbox that redirects pi's built-in tools (read/write/edit/bash)
 * into a Gondolin micro-VM. Based on upstream pi-gondolin.ts but wrapped in a
 * `/sandbox` command so sandboxing is opt-in per session.
 *
 * Usage:
 *   /sandbox          — toggle on/off
 *   /sandbox on       — enable
 *   /sandbox off      — disable
 *   /sandbox status   — show current state
 *
 * Prerequisites:
 *   - brew install qemu
 *   - npm install -g @earendil-works/gondolin
 */

import path from "node:path";

import type {
  ExtensionAPI,
  ExtensionContext,
} from "@mariozechner/pi-coding-agent";
import {
  type BashOperations,
  createBashTool,
  createEditTool,
  createReadTool,
  createWriteTool,
  type EditOperations,
  type ReadOperations,
  type WriteOperations,
} from "@mariozechner/pi-coding-agent";

import { RealFSProvider, VM } from "@earendil-works/gondolin";

const GUEST_WORKSPACE = "/workspace";

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

// ── Gondolin operation factories (from upstream pi-gondolin.ts) ──────

function createGondolinReadOps(vm: VM, localCwd: string): ReadOperations {
  return {
    readFile: async (p) => {
      const guestPath = toGuestPath(localCwd, p);
      const r = await vm.exec(["/bin/cat", guestPath]);
      if (!r.ok) throw new Error(`cat failed (${r.exitCode}): ${r.stderr}`);
      return r.stdoutBuffer;
    },
    access: async (p) => {
      const guestPath = toGuestPath(localCwd, p);
      const r = await vm.exec([
        "/bin/sh",
        "-lc",
        `test -r ${shQuote(guestPath)}`,
      ]);
      if (!r.ok) throw new Error(`not readable: ${p}`);
    },
    detectImageMimeType: async (p) => {
      const guestPath = toGuestPath(localCwd, p);
      try {
        const r = await vm.exec([
          "/bin/sh",
          "-lc",
          `file --mime-type -b ${shQuote(guestPath)}`,
        ]);
        if (!r.ok) return null;
        const m = r.stdout.trim();
        return ["image/jpeg", "image/png", "image/gif", "image/webp"].includes(
          m,
        )
          ? m
          : null;
      } catch {
        return null;
      }
    },
  };
}

function createGondolinWriteOps(vm: VM, localCwd: string): WriteOperations {
  return {
    writeFile: async (p, content) => {
      const guestPath = toGuestPath(localCwd, p);
      const dir = path.posix.dirname(guestPath);
      const b64 = Buffer.from(content, "utf8").toString("base64");
      const script = [
        `set -eu`,
        `mkdir -p ${shQuote(dir)}`,
        `echo ${shQuote(b64)} | base64 -d > ${shQuote(guestPath)}`,
      ].join("\n");
      const r = await vm.exec(["/bin/sh", "-lc", script]);
      if (!r.ok) throw new Error(`write failed (${r.exitCode}): ${r.stderr}`);
    },
    mkdir: async (dir) => {
      const guestDir = toGuestPath(localCwd, dir);
      const r = await vm.exec(["/bin/mkdir", "-p", guestDir]);
      if (!r.ok) throw new Error(`mkdir failed (${r.exitCode}): ${r.stderr}`);
    },
  };
}

function createGondolinEditOps(vm: VM, localCwd: string): EditOperations {
  const r = createGondolinReadOps(vm, localCwd);
  const w = createGondolinWriteOps(vm, localCwd);
  return { readFile: r.readFile, access: r.access, writeFile: w.writeFile };
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

function createGondolinBashOps(vm: VM, localCwd: string): BashOperations {
  return {
    exec: async (command, cwd, { onData, signal, timeout, env }) => {
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
        const proc = vm.exec(["/bin/bash", "-lc", command], {
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
  };
}

// ── Extension ─────────────────────────────────────────────────────────

export default function (pi: ExtensionAPI) {
  const localCwd = process.cwd();

  const localRead = createReadTool(localCwd);
  const localWrite = createWriteTool(localCwd);
  const localEdit = createEditTool(localCwd);
  const localBash = createBashTool(localCwd);

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
    description:
      "Toggle Gondolin sandbox (on/off/status)",
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

  // ── Tool overrides (delegate to VM when sandbox is on) ────────────

  pi.registerTool({
    ...localRead,
    async execute(id, params, signal, onUpdate, ctx) {
      if (!sandboxEnabled)
        return localRead.execute(id, params, signal, onUpdate);
      const activeVm = await ensureVm(ctx);
      const tool = createReadTool(localCwd, {
        operations: createGondolinReadOps(activeVm, localCwd),
      });
      return tool.execute(id, params, signal, onUpdate);
    },
  });

  pi.registerTool({
    ...localWrite,
    async execute(id, params, signal, onUpdate, ctx) {
      if (!sandboxEnabled)
        return localWrite.execute(id, params, signal, onUpdate);
      const activeVm = await ensureVm(ctx);
      const tool = createWriteTool(localCwd, {
        operations: createGondolinWriteOps(activeVm, localCwd),
      });
      return tool.execute(id, params, signal, onUpdate);
    },
  });

  pi.registerTool({
    ...localEdit,
    async execute(id, params, signal, onUpdate, ctx) {
      if (!sandboxEnabled)
        return localEdit.execute(id, params, signal, onUpdate);
      const activeVm = await ensureVm(ctx);
      const tool = createEditTool(localCwd, {
        operations: createGondolinEditOps(activeVm, localCwd),
      });
      return tool.execute(id, params, signal, onUpdate);
    },
  });

  pi.registerTool({
    ...localBash,
    async execute(id, params, signal, onUpdate, ctx) {
      if (!sandboxEnabled)
        return localBash.execute(id, params, signal, onUpdate);
      const activeVm = await ensureVm(ctx);
      const tool = createBashTool(localCwd, {
        operations: createGondolinBashOps(activeVm, localCwd),
      });
      return tool.execute(id, params, signal, onUpdate);
    },
  });

  // User `!` commands → VM when sandbox is on
  pi.on("user_bash", (_event, _ctx) => {
    if (!sandboxEnabled || !vm) return;
    return { operations: createGondolinBashOps(vm, localCwd) };
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
