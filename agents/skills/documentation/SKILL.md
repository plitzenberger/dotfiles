---
name: documentation
description: |
  Build consistent, accumulated project documentation rooted in README.md.
  Trigger automatically whenever creating or updating markdown files in docs/, plans/, research/, or similar directories.
  Also trigger when the user asks to document findings, write a plan, create a spec, or produce any persistent markdown artifact.
---

# Documentation Skill

## Purpose

Build **one coherent, navigable documentation set** for this repository. Every doc
session should leave the reader able to understand the project from `README.md`
alone, then drill into specifics via linked pages in `docs/`.

Documentation is accumulated, not disposable — each session builds on what exists.

---

## Architecture

### The Documentation Tree

```
README.md                  ← Entry point. Project overview + links into docs/
docs/
  index.md                 ← Documentation hub. Categorised links to every doc.
  <topic>.md               ← Evergreen reference pages (one topic per file)
  plans/                   ← Time-bound plans (may graduate to reference docs)
  decisions/               ← ADRs and key decisions
```

### Three Document Types

| Type | Location | Purpose | Lifespan |
|------|----------|---------|----------|
| **Reference** | `docs/<topic>.md` | Evergreen how-to, runbook, or explainer | Permanent, updated in-place |
| **Plan/Motion** | `docs/plans/<name>.md` | Time-bound goal with tasks and status | Until completed or archived |
| **Decision** | `docs/decisions/NNN-<title>.md` | Why we chose X over Y | Permanent |

---

## Rules

### 1. README.md Is the Front Door

- `README.md` stays **concise**: what, why, quickstart, project structure, and a `## Documentation` section linking to `docs/index.md`.
- Never bloat the README with operational detail — link to the right doc instead.
- When you add a new doc that changes the project structure or developer workflow, update the README if relevant.

### 2. docs/index.md Is the Hub

- `docs/index.md` is a **categorised table of contents** for all documentation.
- Every doc in `docs/` **must** be linked from `index.md` under the right category.
- When you create or rename a doc, update `index.md` in the same operation.
- Categories are flexible but start with: **Infrastructure**, **Operations**, **Plans**, **Decisions**.

### 3. One Topic Per File, Accumulate Don't Duplicate

- Before creating a new doc, **check if an existing doc already covers the topic**. Update it instead.
- Each reference doc owns one clear topic (e.g., `ssh-troubleshooting.md`, `pulumi-deploy.md`).
- Cross-reference between docs using relative links (`[see SSH troubleshooting](./ssh-troubleshooting.md)`).

### 4. Keep Motion Docs Connected

Plans and status docs in `docs/plans/` are valuable but ephemeral. Keep them connected:
- Link to them from `docs/index.md` under a **Plans** category with their status.
- When a plan is completed, either archive it (move to `docs/plans/archive/`) or graduate its lasting insights into a reference doc.

### 5. Always Add YAML Frontmatter

Every markdown document you create or significantly update **must** start with:

```yaml
---
title: "<descriptive title>"
date: <YYYY-MM-DD>
status: draft | review | final
tags: [topic1, topic2]
parent: docs/index.md          # what links to this doc
---
```

| Field    | Required | Description |
|----------|----------|-------------|
| `title`  | yes      | Concise, descriptive title (5–10 words) |
| `date`   | yes      | Creation or last-significant-update date (`YYYY-MM-DD`) |
| `status` | yes      | `draft`, `review`, or `final` |
| `tags`   | no       | Topic tags for discoverability |
| `parent` | no       | Relative path to the parent/hub doc |

### 6. When Updating Existing Docs

- **Preserve** all existing fields and content you're not intentionally changing.
- **Update** `date` to today.
- **Update** `status` if appropriate.
- **Improve** — fix stale information, broken links, or inconsistencies you notice.

### 7. What NOT to Include

Never embed in committed documents:

- Session IDs, run IDs, or trace IDs
- Absolute filesystem paths (e.g. `/Users/name/...`)
- Usernames, hostnames, or machine identifiers
- Model names or provider details
- API keys, tokens, or credentials

### 8. Writing Style

- **Scannable**: Use headings, tables, and bullet points. Lead with the answer.
- **Actionable**: Runbooks should have copy-pasteable commands.
- **Consistent**: Use the same terminology across docs (match what the codebase uses).
- **Linked**: Always cross-reference related docs rather than repeating information.

---

## Workflow Checklist

When you create or update documentation, verify:

- [ ] Frontmatter is present and correct
- [ ] `docs/index.md` links to this doc (create index.md if it doesn't exist)
- [ ] `README.md` updated if the doc affects quickstart or project structure
- [ ] No orphan docs — every page is reachable from the index
- [ ] No duplicate topics — information lives in one place
- [ ] Cross-references use relative links
- [ ] Stale content in related docs is updated
