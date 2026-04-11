/**
 * Prompt Navigator — right-anchored persistent overlay panel
 *
 * Lists user prompts with response previews. Navigate independently
 * of the main conversation scroll.
 *
 * Shortcuts:
 *   Alt+Shift+S  — toggle panel visibility
 *   Alt+↑/↓      — navigate prompt list
 *   Alt+Shift+↑/↓ — scroll response preview
 *   Escape        — hide panel (when panel has focus)
 */

import type { ExtensionAPI, Theme } from "@mariozechner/pi-coding-agent";
import {
	matchesKey,
	Key,
	truncateToWidth,
	visibleWidth,
	wrapTextWithAnsi,
} from "@mariozechner/pi-tui";

// ── Types ──────────────────────────────────────────────────────────

interface PromptEntry {
	entryId: string;
	text: string; // first line of user prompt
	fullText: string;
	responseText: string; // extracted text content from assistant response
	index: number;
}

interface NavigatorState {
	prompts: PromptEntry[];
	selectedIndex: number;
	responseScrollOffset: number;
	visible: boolean;
}

// ── Helpers ────────────────────────────────────────────────────────

/** Extract plain text from user message content */
function extractUserText(content: string | Array<{ type: string; text?: string }>): string {
	if (typeof content === "string") return content;
	return content
		.filter((b) => b.type === "text" && b.text)
		.map((b) => b.text!)
		.join("\n");
}

/** Extract text-only content from assistant message, stripping tool calls and thinking */
function extractAssistantText(
	content: Array<{ type: string; text?: string; thinking?: string }>,
): string {
	return content
		.filter((b) => b.type === "text" && b.text)
		.map((b) => b.text!)
		.join("\n");
}

/** Truncate to first line, max N chars */
function firstLine(text: string, maxLen: number): string {
	const line = text.split("\n")[0] ?? "";
	if (line.length > maxLen) return line.slice(0, maxLen - 1) + "…";
	return line;
}

// ── Build prompt list from branch ──────────────────────────────────

function buildPromptList(
	getBranch: () => Array<{ type: string; id: string; message?: any }>,
): PromptEntry[] {
	const entries = getBranch();
	const prompts: PromptEntry[] = [];

	for (let i = 0; i < entries.length; i++) {
		const entry = entries[i]!;
		if (entry.type !== "message" || entry.message?.role !== "user") continue;

		const fullText = extractUserText(entry.message.content);
		const text = firstLine(fullText, 40);

		// Find the next assistant message for response preview
		let responseText = "";
		for (let j = i + 1; j < entries.length; j++) {
			const next = entries[j]!;
			if (next.type === "message" && next.message?.role === "assistant") {
				responseText = extractAssistantText(next.message.content);
				break;
			}
			// Stop if we hit another user message
			if (next.type === "message" && next.message?.role === "user") break;
		}

		prompts.push({
			entryId: entry.id,
			text,
			fullText,
			responseText,
			index: prompts.length,
		});
	}

	return prompts;
}

// ── Component ──────────────────────────────────────────────────────

class PromptNavigatorComponent {
	private cachedWidth?: number;
	private cachedLines?: string[];

	constructor(
		private state: NavigatorState,
		private theme: Theme,
	) {}

	handleInput(data: string): boolean {
		// Alt+Up / Alt+Down — navigate prompt list
		if (matchesKey(data, Key.alt("up"))) {
			if (this.state.selectedIndex > 0) {
				this.state.selectedIndex--;
				this.state.responseScrollOffset = 0;
				this.invalidate();
			}
			return true;
		}
		if (matchesKey(data, Key.alt("down"))) {
			if (this.state.selectedIndex < this.state.prompts.length - 1) {
				this.state.selectedIndex++;
				this.state.responseScrollOffset = 0;
				this.invalidate();
			}
			return true;
		}

		// Alt+Shift+Up / Alt+Shift+Down — scroll response preview
		if (matchesKey(data, Key.altShift("up"))) {
			if (this.state.responseScrollOffset > 0) {
				this.state.responseScrollOffset--;
				this.invalidate();
			}
			return true;
		}
		if (matchesKey(data, Key.altShift("down"))) {
			this.state.responseScrollOffset++;
			this.invalidate();
			return true;
		}

		return false;
	}

	render(width: number): string[] {
		if (this.cachedLines && this.cachedWidth === width) {
			return this.cachedLines;
		}

		const th = this.theme;
		const innerW = width - 2;
		const lines: string[] = [];

		const pad = (s: string, len: number) => {
			const vis = visibleWidth(s);
			return s + " ".repeat(Math.max(0, len - vis));
		};
		const row = (content: string) =>
			th.fg("border", "│") + pad(content, innerW) + th.fg("border", "│");
		const emptyRow = () => row("");

		// ── Header ──
		lines.push(th.fg("border", `╭${"─".repeat(innerW)}╮`));
		const title = th.fg("accent", th.bold("PROMPT NAVIGATOR"));
		const count =
			this.state.prompts.length > 0
				? th.fg("muted", ` ${this.state.selectedIndex + 1}/${this.state.prompts.length}`)
				: th.fg("muted", " 0 prompts");
		lines.push(row(` ${title}${count}`));
		lines.push(th.fg("border", `├${"─".repeat(innerW)}┤`));

		if (this.state.prompts.length === 0) {
			lines.push(emptyRow());
			lines.push(row(` ${th.fg("dim", "No prompts yet")}`));
			lines.push(emptyRow());
			lines.push(th.fg("border", `╰${"─".repeat(innerW)}╯`));
			this.cachedWidth = width;
			this.cachedLines = lines;
			return lines;
		}

		// ── Prompt List ──
		// Show a window of prompts around the selected one
		const maxVisible = 8;
		const total = this.state.prompts.length;
		const sel = this.state.selectedIndex;

		let startIdx = Math.max(0, sel - Math.floor(maxVisible / 2));
		let endIdx = Math.min(total, startIdx + maxVisible);
		if (endIdx - startIdx < maxVisible) {
			startIdx = Math.max(0, endIdx - maxVisible);
		}

		for (let i = startIdx; i < endIdx; i++) {
			const p = this.state.prompts[i]!;
			const isSelected = i === sel;
			const prefix = isSelected ? "▸" : " ";
			const num = th.fg("dim", `${(i + 1).toString().padStart(2)}.`);
			const label = isSelected ? th.fg("accent", p.text) : th.fg("text", p.text);
			const line = ` ${prefix}${num} ${label}`;
			lines.push(row(truncateToWidth(line, innerW)));
		}

		if (total > maxVisible) {
			const scrollInfo = th.fg("dim", `  ↕ ${total - maxVisible} more`);
			lines.push(row(scrollInfo));
		}

		// ── Response Preview ──
		lines.push(th.fg("border", `├${"─".repeat(innerW)}┤`));

		const selected = this.state.prompts[sel];
		if (selected && selected.responseText) {
			const previewLabel = th.fg("muted", " Response Preview");
			lines.push(row(previewLabel));
			lines.push(emptyRow());

			// Wrap and show response text
			const maxPreviewLines = 12;
			const responseLines = wrapTextWithAnsi(selected.responseText, innerW - 2);
			const offset = Math.min(
				this.state.responseScrollOffset,
				Math.max(0, responseLines.length - maxPreviewLines),
			);
			// Clamp the scroll offset to valid range
			this.state.responseScrollOffset = offset;

			const visibleLines = responseLines.slice(offset, offset + maxPreviewLines);
			for (const rl of visibleLines) {
				lines.push(row(` ${th.fg("dim", truncateToWidth(rl, innerW - 1))}`));
			}

			if (responseLines.length > maxPreviewLines) {
				const scrollHint = th.fg(
					"dim",
					` ↕ ${offset + 1}-${Math.min(offset + maxPreviewLines, responseLines.length)}/${responseLines.length}`,
				);
				lines.push(row(scrollHint));
			}
		} else if (selected) {
			lines.push(row(` ${th.fg("dim", "No response yet")}`));
		}

		// ── Footer ──
		lines.push(th.fg("border", `├${"─".repeat(innerW)}┤`));
		const help = th.fg("dim", " Alt+↑↓ nav • Alt+⇧↑↓ scroll • Alt+⇧S hide");
		lines.push(row(truncateToWidth(help, innerW)));
		lines.push(th.fg("border", `╰${"─".repeat(innerW)}╯`));

		this.cachedWidth = width;
		this.cachedLines = lines;
		return lines;
	}

	invalidate(): void {
		this.cachedWidth = undefined;
		this.cachedLines = undefined;
	}
}

// ── Extension Entry Point ──────────────────────────────────────────

export default function (pi: ExtensionAPI) {
	let state: NavigatorState = {
		prompts: [],
		selectedIndex: 0,
		responseScrollOffset: 0,
		visible: true,
	};

	let overlayHandle: { setHidden: (h: boolean) => void; hide: () => void; requestRender: () => void } | null =
		null;
	let component: PromptNavigatorComponent | null = null;

	function rebuildPrompts(getBranch: () => any[]) {
		state.prompts = buildPromptList(getBranch);
		// Clamp selection
		if (state.selectedIndex >= state.prompts.length) {
			state.selectedIndex = Math.max(0, state.prompts.length - 1);
		}
		state.responseScrollOffset = 0;
		component?.invalidate();
		overlayHandle?.requestRender();
	}

	function toggleVisibility() {
		state.visible = !state.visible;
		overlayHandle?.setHidden(!state.visible);
	}

	// ── Toggle shortcut ──
	pi.registerShortcut("alt+shift+s", {
		description: "Toggle Prompt Navigator",
		handler: async () => {
			toggleVisibility();
		},
	});

	// ── Session start: build initial list + create overlay ──
	pi.on("session_start", async (_event, ctx) => {
		// Rebuild from current branch
		state.prompts = buildPromptList(() => ctx.sessionManager.getBranch() as any[]);
		state.selectedIndex = Math.max(0, state.prompts.length - 1); // select latest
		state.responseScrollOffset = 0;

		// Create persistent overlay (don't await — it stays open)
		ctx.ui.custom(
			(_tui, theme, _kb, _done) => {
				component = new PromptNavigatorComponent(state, theme);
				return {
					render: (w: number) => component!.render(w),
					invalidate: () => component!.invalidate(),
					handleInput: (data: string) => {
						component!.handleInput(data);
						overlayHandle?.requestRender();
					},
				};
			},
			{
				overlay: true,
				overlayOptions: {
					anchor: "right-center" as const,
					width: "30%",
					minWidth: 32,
					maxHeight: "90%",
					visible: (w: number) => w >= 120 && state.visible,
				},
				onHandle: (handle: any) => {
					overlayHandle = handle;
				},
			},
		);
	});

	// ── Track new messages ──
	pi.on("message_end", async (event, ctx) => {
		if (!event.message) return;

		if (event.message.role === "user") {
			// New user prompt — add to list
			const fullText = extractUserText(event.message.content);
			state.prompts.push({
				entryId: "", // will be filled on next rebuild
				text: firstLine(fullText, 40),
				fullText,
				responseText: "",
				index: state.prompts.length,
			});
			state.selectedIndex = state.prompts.length - 1;
			state.responseScrollOffset = 0;
			component?.invalidate();
			overlayHandle?.requestRender();
		} else if (event.message.role === "assistant" && state.prompts.length > 0) {
			// Update the latest prompt's response preview
			const latest = state.prompts[state.prompts.length - 1]!;
			if (!latest.responseText) {
				latest.responseText = extractAssistantText(event.message.content);
				component?.invalidate();
				overlayHandle?.requestRender();
			}
		}
	});

	// ── Rebuild on compaction ──
	pi.on("session_compact", async (_event, ctx) => {
		rebuildPrompts(() => ctx.sessionManager.getBranch() as any[]);
	});

	// ── Rebuild on tree navigation ──
	pi.on("session_tree", async (_event, ctx) => {
		rebuildPrompts(() => ctx.sessionManager.getBranch() as any[]);
	});

	// ── Cleanup on shutdown ──
	pi.on("session_shutdown", async () => {
		overlayHandle?.hide();
		overlayHandle = null;
		component = null;
	});
}
