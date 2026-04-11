/**
 * Response Profiles Extension
 *
 * Switch between response styles mid-session. Each profile injects
 * instructions via before_agent_start to shape the agent's tone,
 * verbosity, and formatting.
 *
 * Usage:
 *   /profile              — open selector
 *   /profile laconic      — switch directly
 *   Ctrl+Shift+R          — cycle through profiles
 *
 * Profiles are defined below and can be extended easily.
 */

import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { DynamicBorder } from "@mariozechner/pi-coding-agent";
import { Container, Key, type SelectItem, SelectList, Text } from "@mariozechner/pi-tui";

interface Profile {
  label: string;
  description: string;
  instructions: string;
}

const PROFILES: Record<string, Profile> = {
  laconic: {
    label: "Laconic",
    description: "Minimal output. No filler, no preamble. Code > prose.",
    instructions: [
      "Response style: LACONIC.",
      "- Be extremely terse. Omit greetings, preamble, and filler.",
      "- Prefer code blocks and bullet points over paragraphs.",
      "- If the answer is a single line, give just that line.",
      "- Do not restate the question. Do not summarise what you did unless asked.",
      "- Never say 'Sure!', 'Great question!', 'Let me…', or similar.",
    ].join("\n"),
  },
  balanced: {
    label: "Balanced",
    description: "Default. Concise but explains reasoning when useful.",
    instructions: [
      "Response style: BALANCED.",
      "- Be concise but not curt. Explain reasoning for non-trivial decisions.",
      "- Use headings and bullets for structure when helpful.",
      "- Skip preamble and pleasantries but do summarise completed work briefly.",
    ].join("\n"),
  },
  verbose: {
    label: "Verbose",
    description: "Detailed explanations, step-by-step, teaching mode.",
    instructions: [
      "Response style: VERBOSE / TEACHING.",
      "- Explain your reasoning step by step.",
      "- When making changes, explain WHY, not just what.",
      "- Provide context, alternatives considered, and trade-offs.",
      "- Use examples and analogies where they aid understanding.",
      "- Summarise what was done and suggest next steps.",
    ].join("\n"),
  },
  technical: {
    label: "Technical",
    description: "Dense, precise, jargon-ok. For deep dives.",
    instructions: [
      "Response style: TECHNICAL.",
      "- Use precise technical terminology without simplification.",
      "- Include relevant implementation details, edge cases, and caveats.",
      "- Reference specific APIs, types, and function signatures.",
      "- Assume expert-level familiarity with the domain.",
      "- Prefer accuracy and completeness over brevity.",
    ].join("\n"),
  },
};

const PROFILE_ORDER = ["laconic", "balanced", "verbose", "technical"];

export default function (pi: ExtensionAPI) {
  let activeProfileName: string | undefined;

  function updateStatus(ctx: ExtensionContext) {
    if (activeProfileName) {
      ctx.ui.setStatus(
        "response-profile",
        ctx.ui.theme.fg("accent", `✎ ${activeProfileName}`)
      );
    } else {
      ctx.ui.setStatus("response-profile", undefined);
    }
  }

  // Inject instructions into system prompt
  pi.on("before_agent_start", async (event) => {
    if (activeProfileName) {
      const profile = PROFILES[activeProfileName];
      if (profile) {
        return {
          systemPrompt: `${event.systemPrompt}\n\n${profile.instructions}`,
        };
      }
    }
  });

  // Cycle shortcut
  pi.registerShortcut(Key.ctrlShift("r"), {
    description: "Cycle response profile",
    handler: async (ctx) => {
      const cycle = [undefined, ...PROFILE_ORDER];
      const currentIdx = activeProfileName
        ? cycle.indexOf(activeProfileName)
        : 0;
      const nextIdx = (currentIdx + 1) % cycle.length;
      activeProfileName = cycle[nextIdx] as string | undefined;

      if (activeProfileName) {
        ctx.ui.notify(
          `Profile: ${PROFILES[activeProfileName].label}`,
          "info"
        );
      } else {
        ctx.ui.notify("Profile cleared (default)", "info");
      }
      updateStatus(ctx);
    },
  });

  // Selector UI
  async function showSelector(ctx: ExtensionContext): Promise<void> {
    const items: SelectItem[] = PROFILE_ORDER.map((name) => {
      const p = PROFILES[name];
      const isActive = name === activeProfileName;
      return {
        value: name,
        label: isActive ? `${p.label} (active)` : p.label,
        description: p.description,
      };
    });
    items.push({
      value: "(none)",
      label: "(none)",
      description: "Clear profile, use default response style",
    });

    const result = await ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
      const container = new Container();
      container.addChild(new DynamicBorder((str) => theme.fg("accent", str)));
      container.addChild(
        new Text(theme.fg("accent", theme.bold("Response Profile")))
      );

      const selectList = new SelectList(items, items.length, {
        selectedPrefix: (text) => theme.fg("accent", text),
        selectedText: (text) => theme.fg("accent", text),
        description: (text) => theme.fg("muted", text),
        scrollInfo: (text) => theme.fg("dim", text),
        noMatch: (text) => theme.fg("warning", text),
      });

      selectList.onSelect = (item) => done(item.value);
      selectList.onCancel = () => done(null);
      container.addChild(selectList);
      container.addChild(
        new Text(theme.fg("dim", "↑↓ navigate • enter select • esc cancel"))
      );
      container.addChild(new DynamicBorder((str) => theme.fg("accent", str)));

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
    });

    if (!result) return;

    if (result === "(none)") {
      activeProfileName = undefined;
      ctx.ui.notify("Profile cleared", "info");
    } else {
      activeProfileName = result;
      ctx.ui.notify(`Profile: ${PROFILES[result].label}`, "info");
    }
    updateStatus(ctx);
  }

  // /profile command
  pi.registerCommand("profile", {
    description: "Switch response profile (laconic, balanced, verbose, technical)",
    getArgumentCompletions: (prefix: string) => {
      const items = PROFILE_ORDER.map((name) => ({
        value: name,
        label: name,
      }));
      const filtered = items.filter((i) => i.value.startsWith(prefix));
      return filtered.length > 0 ? filtered : null;
    },
    handler: async (args, ctx) => {
      if (args?.trim()) {
        const name = args.trim().toLowerCase();
        if (!PROFILES[name]) {
          ctx.ui.notify(
            `Unknown profile "${name}". Available: ${PROFILE_ORDER.join(", ")}`,
            "error"
          );
          return;
        }
        activeProfileName = name;
        ctx.ui.notify(`Profile: ${PROFILES[name].label}`, "info");
        updateStatus(ctx);
        return;
      }
      await showSelector(ctx);
    },
  });

  // Restore from session state
  pi.on("session_start", async (_event, ctx) => {
    const entries = ctx.sessionManager.getEntries();
    const stateEntry = entries
      .filter(
        (e: { type: string; customType?: string }) =>
          e.type === "custom" && e.customType === "response-profile-state"
      )
      .pop() as { data?: { name: string } } | undefined;

    if (stateEntry?.data?.name && PROFILES[stateEntry.data.name]) {
      activeProfileName = stateEntry.data.name;
    }
    updateStatus(ctx);
  });

  // Persist state
  pi.on("turn_start", async () => {
    pi.appendEntry("response-profile-state", {
      name: activeProfileName ?? null,
    });
  });
}
