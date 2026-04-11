/**
 * Presets Extension
 *
 * Unified system for model, thinking level, tools, response style, and
 * instructions. Replaces the separate response-profiles extension.
 *
 * Config files (merged, project takes precedence):
 * - ~/.pi/agent/presets.json  (global)
 * - <cwd>/.pi/presets.json    (project-local)
 *
 * Special keys:
 * - _styles: { name: "instruction text" } — named style registry
 * - _default: "preset-name"              — auto-apply on session start
 *
 * A preset's `style` field selects from _styles. The `instructions` field
 * stacks on top. So style provides base tone, instructions adds domain context.
 *
 * Usage:
 *   /preset              — open selector
 *   /preset review       — switch directly
 *   Ctrl+Shift+U         — cycle through presets
 *   pi --preset review   — CLI flag
 */

import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import type { ExtensionAPI, ExtensionContext } from "@mariozechner/pi-coding-agent";
import { DynamicBorder, getAgentDir } from "@mariozechner/pi-coding-agent";
import { Container, Key, type SelectItem, SelectList, Text } from "@mariozechner/pi-tui";

interface Preset {
	provider?: string;
	model?: string;
	thinkingLevel?: "off" | "minimal" | "low" | "medium" | "high" | "xhigh";
	tools?: string[];
	/** Named style from _styles registry */
	style?: string;
	/** Additional instructions — stacked on top of style */
	instructions?: string;
}

interface PresetsFile {
	_styles?: Record<string, string>;
	_default?: string;
	[name: string]: Preset | Record<string, string> | string | undefined;
}

interface LoadedPresets {
	presets: Record<string, Preset>;
	styles: Record<string, string>;
	defaultPreset: string | undefined;
}

/**
 * Load and merge presets from global + project config files.
 * Project-local presets/styles override global ones with the same name.
 * Project _default overrides global _default.
 */
function loadPresets(cwd: string): LoadedPresets {
	const globalPath = join(getAgentDir(), "presets.json");
	const projectPath = join(cwd, ".pi", "presets.json");

	let globalFile: PresetsFile = {};
	let projectFile: PresetsFile = {};

	if (existsSync(globalPath)) {
		try {
			globalFile = JSON.parse(readFileSync(globalPath, "utf-8"));
		} catch (err) {
			console.error(`Failed to load global presets from ${globalPath}: ${err}`);
		}
	}

	if (existsSync(projectPath)) {
		try {
			projectFile = JSON.parse(readFileSync(projectPath, "utf-8"));
		} catch (err) {
			console.error(`Failed to load project presets from ${projectPath}: ${err}`);
		}
	}

	// Merge styles (project overrides global)
	const styles: Record<string, string> = {
		...(globalFile._styles ?? {}),
		...(projectFile._styles ?? {}),
	};

	// Determine default (project overrides global)
	const defaultPreset = projectFile._default ?? globalFile._default;

	// Extract presets (skip _ keys)
	const presets: Record<string, Preset> = {};
	for (const file of [globalFile, projectFile]) {
		for (const [key, value] of Object.entries(file)) {
			if (key.startsWith("_")) continue;
			presets[key] = value as Preset;
		}
	}

	return { presets, styles, defaultPreset };
}

export default function presetExtension(pi: ExtensionAPI) {
	let loaded: LoadedPresets = { presets: {}, styles: {}, defaultPreset: undefined };
	let activePresetName: string | undefined;
	let activePreset: Preset | undefined;

	// Register --preset CLI flag
	pi.registerFlag("preset", {
		description: "Preset configuration to use",
		type: "string",
	});

	/**
	 * Resolve the full instruction text for a preset by stacking
	 * style instructions (from _styles) + preset instructions.
	 */
	function resolveInstructions(preset: Preset): string | undefined {
		const parts: string[] = [];

		if (preset.style && loaded.styles[preset.style]) {
			parts.push(loaded.styles[preset.style]);
		}

		if (preset.instructions) {
			parts.push(preset.instructions);
		}

		return parts.length > 0 ? parts.join("\n\n") : undefined;
	}

	/**
	 * Apply a preset configuration.
	 */
	async function applyPreset(name: string, preset: Preset, ctx: ExtensionContext): Promise<boolean> {
		if (preset.provider && preset.model) {
			const model = ctx.modelRegistry.find(preset.provider, preset.model);
			if (model) {
				const success = await pi.setModel(model);
				if (!success) {
					ctx.ui.notify(`Preset "${name}": No API key for ${preset.provider}/${preset.model}`, "warning");
				}
			} else {
				ctx.ui.notify(`Preset "${name}": Model ${preset.provider}/${preset.model} not found`, "warning");
			}
		}

		if (preset.thinkingLevel) {
			pi.setThinkingLevel(preset.thinkingLevel);
		}

		if (preset.tools && preset.tools.length > 0) {
			const allToolNames = pi.getAllTools().map((t) => t.name);
			const validTools = preset.tools.filter((t) => allToolNames.includes(t));
			const invalidTools = preset.tools.filter((t) => !allToolNames.includes(t));

			if (invalidTools.length > 0) {
				ctx.ui.notify(`Preset "${name}": Unknown tools: ${invalidTools.join(", ")}`, "warning");
			}
			if (validTools.length > 0) {
				pi.setActiveTools(validTools);
			}
		}

		activePresetName = name;
		activePreset = preset;
		return true;
	}

	/**
	 * Build description string for a preset.
	 */
	function buildPresetDescription(preset: Preset): string {
		const parts: string[] = [];

		if (preset.provider && preset.model) {
			parts.push(`${preset.provider}/${preset.model}`);
		}
		if (preset.thinkingLevel) {
			parts.push(`thinking:${preset.thinkingLevel}`);
		}
		if (preset.style) {
			parts.push(`style:${preset.style}`);
		}
		if (preset.tools) {
			parts.push(`tools:${preset.tools.join(",")}`);
		}
		if (preset.instructions) {
			const truncated =
				preset.instructions.length > 30 ? `${preset.instructions.slice(0, 27)}...` : preset.instructions;
			parts.push(`"${truncated}"`);
		}

		return parts.join(" | ");
	}

	/**
	 * Show preset selector UI.
	 */
	async function showPresetSelector(ctx: ExtensionContext): Promise<void> {
		const presetNames = Object.keys(loaded.presets);

		if (presetNames.length === 0) {
			ctx.ui.notify("No presets defined. Add presets to ~/.pi/agent/presets.json or .pi/presets.json", "warning");
			return;
		}

		const items: SelectItem[] = presetNames.map((name) => {
			const preset = loaded.presets[name];
			const isActive = name === activePresetName;
			return {
				value: name,
				label: isActive ? `${name} (active)` : name,
				description: buildPresetDescription(preset),
			};
		});

		items.push({
			value: "(none)",
			label: "(none)",
			description: "Clear active preset, restore defaults",
		});

		const result = await ctx.ui.custom<string | null>((tui, theme, _kb, done) => {
			const container = new Container();
			container.addChild(new DynamicBorder((str) => theme.fg("accent", str)));
			container.addChild(new Text(theme.fg("accent", theme.bold("Select Preset"))));

			const selectList = new SelectList(items, Math.min(items.length, 10), {
				selectedPrefix: (text) => theme.fg("accent", text),
				selectedText: (text) => theme.fg("accent", text),
				description: (text) => theme.fg("muted", text),
				scrollInfo: (text) => theme.fg("dim", text),
				noMatch: (text) => theme.fg("warning", text),
			});

			selectList.onSelect = (item) => done(item.value);
			selectList.onCancel = () => done(null);
			container.addChild(selectList);
			container.addChild(new Text(theme.fg("dim", "↑↓ navigate • enter select • esc cancel")));
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
			activePresetName = undefined;
			activePreset = undefined;
			pi.setActiveTools(["read", "bash", "edit", "write"]);
			ctx.ui.notify("Preset cleared, defaults restored", "info");
			updateStatus(ctx);
			return;
		}

		const preset = loaded.presets[result];
		if (preset) {
			await applyPreset(result, preset, ctx);
			ctx.ui.notify(`Preset "${result}" activated`, "info");
			updateStatus(ctx);
		}
	}

	function updateStatus(ctx: ExtensionContext) {
		if (activePresetName) {
			ctx.ui.setStatus("preset", ctx.ui.theme.fg("accent", `preset:${activePresetName}`));
		} else {
			ctx.ui.setStatus("preset", undefined);
		}
	}

	// Cycle through presets with Ctrl+Shift+U
	pi.registerShortcut(Key.ctrlShift("u"), {
		description: "Cycle presets",
		handler: async (ctx) => {
			const presetNames = Object.keys(loaded.presets).sort();
			if (presetNames.length === 0) {
				ctx.ui.notify("No presets defined", "warning");
				return;
			}

			const cycleList = ["(none)", ...presetNames];
			const currentName = activePresetName ?? "(none)";
			const currentIndex = cycleList.indexOf(currentName);
			const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % cycleList.length;
			const nextName = cycleList[nextIndex];

			if (nextName === "(none)") {
				activePresetName = undefined;
				activePreset = undefined;
				pi.setActiveTools(["read", "bash", "edit", "write"]);
				ctx.ui.notify("Preset cleared, defaults restored", "info");
			} else {
				const preset = loaded.presets[nextName];
				if (preset) {
					await applyPreset(nextName, preset, ctx);
					ctx.ui.notify(`Preset "${nextName}" activated`, "info");
				}
			}
			updateStatus(ctx);
		},
	});

	// /preset command with completions
	pi.registerCommand("preset", {
		description: "Switch preset configuration",
		getArgumentCompletions: (prefix: string) => {
			const items = Object.keys(loaded.presets).map((name) => ({
				value: name,
				label: name,
			}));
			const filtered = items.filter((i) => i.value.startsWith(prefix));
			return filtered.length > 0 ? filtered : null;
		},
		handler: async (args, ctx) => {
			if (args?.trim()) {
				const name = args.trim();
				const preset = loaded.presets[name];

				if (!preset) {
					const available = Object.keys(loaded.presets).join(", ") || "(none defined)";
					ctx.ui.notify(`Unknown preset "${name}". Available: ${available}`, "error");
					return;
				}

				await applyPreset(name, preset, ctx);
				ctx.ui.notify(`Preset "${name}" activated`, "info");
				updateStatus(ctx);
				return;
			}

			await showPresetSelector(ctx);
		},
	});

	// Inject style + instructions into system prompt
	pi.on("before_agent_start", async (event) => {
		if (activePreset) {
			const instructions = resolveInstructions(activePreset);
			if (instructions) {
				return {
					systemPrompt: `${event.systemPrompt}\n\n${instructions}`,
				};
			}
		}
	});

	// Initialize on session start
	pi.on("session_start", async (_event, ctx) => {
		loaded = loadPresets(ctx.cwd);

		// 1. CLI --preset flag takes highest priority
		const presetFlag = pi.getFlag("preset");
		if (typeof presetFlag === "string" && presetFlag) {
			const preset = loaded.presets[presetFlag];
			if (preset) {
				await applyPreset(presetFlag, preset, ctx);
				ctx.ui.notify(`Preset "${presetFlag}" activated`, "info");
			} else {
				const available = Object.keys(loaded.presets).join(", ") || "(none defined)";
				ctx.ui.notify(`Unknown preset "${presetFlag}". Available: ${available}`, "warning");
			}
			updateStatus(ctx);
			return;
		}

		// 2. Restore from session state (compaction survival)
		const entries = ctx.sessionManager.getEntries();
		const presetEntry = entries
			.filter((e: { type: string; customType?: string }) => e.type === "custom" && e.customType === "preset-state")
			.pop() as { data?: { name: string } } | undefined;

		if (presetEntry?.data?.name) {
			const preset = loaded.presets[presetEntry.data.name];
			if (preset) {
				activePresetName = presetEntry.data.name;
				activePreset = preset;
				// Don't re-apply model/tools on restore, just keep name for instructions
				updateStatus(ctx);
				return;
			}
		}

		// 3. Auto-apply _default if no preset is active
		if (loaded.defaultPreset) {
			const preset = loaded.presets[loaded.defaultPreset];
			if (preset) {
				await applyPreset(loaded.defaultPreset, preset, ctx);
				ctx.ui.notify(`Default preset "${loaded.defaultPreset}" applied`, "info");
			}
		}

		updateStatus(ctx);
	});

	// Persist preset state across compaction
	pi.on("turn_start", async () => {
		if (activePresetName) {
			pi.appendEntry("preset-state", { name: activePresetName });
		}
	});
}
