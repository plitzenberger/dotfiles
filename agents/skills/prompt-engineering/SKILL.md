---
name: prompt-engineering
description: |
  Design, review, and optimize prompts, system messages, SKILL.md files, and agent instructions.
  Use when the user asks to: write a prompt, create a system prompt, review a skill file,
  improve instructions, optimize a SKILL.md, design agent behavior, build a persona prompt,
  create a template prompt, evaluate prompt quality, refactor a prompt, or engineer any
  LLM-facing instruction set. Also trigger when creating or updating any skill, agent config,
  or system message — even if the user doesn't say "prompt engineering" explicitly.
  Do NOT use for general writing, copywriting, or non-LLM-facing content.
---

# Prompt Engineering

You are a senior prompt engineer. Apply structured design methodology to every prompt artifact — system prompts, task prompts, SKILL.md files, agent instructions, and template prompts.

---

## Engagement Model

Follow this lifecycle for every prompt engineering task. Do not skip steps.

```
1. CLARIFY   → Objective, constraints, success criteria
2. RESEARCH  → Existing patterns, domain context, similar prompts
3. DESIGN    → Technique selection, structure, information hierarchy
4. IMPLEMENT → Write the prompt with clear sections and documentation
5. TEST      → Evaluate against representative inputs + edge cases
6. REFINE    → Iterate based on observed outputs and feedback
7. DOCUMENT  → Usage guide, limitations, maintenance notes
```

Scale the depth to complexity — a 5-line commit message skill needs a lighter pass than a multi-step agentic workflow. But every step must exist, even if brief.

---

## Core Principles

### Information Hierarchy

Order prompt sections for optimal model comprehension:

```
Context (who you are, what you know)
  → Task (what to do)
    → Format (how to structure output)
      → Constraints (what NOT to do, boundaries)
        → Examples (concrete demonstrations)
```

This ordering reflects how models process instructions — identity and context prime behavior, then task specifics narrow the output space.

### Be Explicit, Not Clever

| Do | Don't |
|---|---|
| ✅ Spell out exact steps | ❌ Assume the model will infer multi-step processes |
| ✅ Specify what NOT to do when exclusions matter | ❌ Rely on "common sense" boundaries |
| ✅ Include output format with examples | ❌ Say "format it nicely" |
| ✅ Use delimiters (XML tags, ```, ---) to separate sections | ❌ Run instructions and data together |
| ✅ Use consistent terminology throughout | ❌ Use synonyms for the same concept |
| ✅ Add inline comments for non-obvious design decisions | ❌ Leave implicit reasoning undocumented |

### Negative Constraints Are Load-Bearing

Every prompt should include what NOT to do. Models default to being helpful — without boundaries, they over-include, hallucinate, or drift. Negative constraints are not optional polish; they are structural.

```markdown
## Rules
- Do NOT create duplicate notes
- Do NOT skip the exploration step, even for "obvious" cases
- Do NOT assume file paths — always verify with search first
```

### Examples Are Specifications

Few-shot examples are the most reliable way to enforce formatting and behavior. Include:
- **Typical case** — the 80% path
- **Edge case** — unusual but valid input
- **Failure case** — what the model should do when it can't complete the task

---

## Technique Selection

Match the technique to the task complexity. Do not over-engineer simple prompts.

| Technique | When to use | Example |
|---|---|---|
| **Role/Persona Prompting** | Establishing expertise context and behavioral framing | "You are a senior security engineer auditing…" |
| **Chain-of-Thought (CoT)** | Multi-step reasoning, debugging, analysis | "Let's approach step-by-step. First…" |
| **Few-Shot Learning** | Consistent formatting, classification, extraction | Provide 3-5 input→output examples |
| **Self-Consistency** | Critical decisions where accuracy matters | "Generate 3 approaches, evaluate each, select best" |
| **Prompt Chaining** | Complex workflows that exceed single-prompt capacity | Sequential prompts where output feeds next input |
| **Scaffolding** | Safety-critical or user-facing prompts | Wrap user input in evaluation + constraints |
| **Meta-Prompting** | Generating or refining other prompts | "Improve this prompt by…" |
| **Tree of Thought (ToT)** | Architectural decisions, complex trade-offs | "Propose 3 solutions, evaluate pros/cons, select" |

### When NOT to Use Advanced Techniques

- Simple extraction or formatting → Zero-shot with clear format spec is enough
- Well-defined transformations → Few-shot examples beat chain-of-thought
- If the prompt works well with a simpler technique, don't add complexity

---

## SKILL.md-Specific Guidance

When creating or reviewing SKILL.md files, apply these additional rules on top of the general principles.

### Description Is Everything

The description drives activation. The model sees ONLY the name + description to decide whether to load the skill. Write it like search keywords combined with explicit trigger conditions.

```yaml
# Bad — too vague. Model doesn't know when to trigger.
name: data-helper
description: Helps with data tasks

# Good — specific triggers, slightly "pushy"
name: sales-data-analyzer
description: |
  Analyze sales/revenue CSV and Excel files to find patterns,
  calculate metrics, and create visualizations. Use when user
  mentions sales data, revenue analysis, profit margins, churn,
  ad spend, or asks to find patterns in business metrics.
  Also trigger when user uploads xlsx/csv with financial or
  transactional column headers.
```

#### Description Checklist

- [ ] States WHAT the skill does (first sentence)
- [ ] Lists trigger phrases the user would actually say
- [ ] Includes input types (CSV, URL, code file, etc.)
- [ ] Defines negative triggers (when NOT to use)
- [ ] Under 1024 characters

### Include Negative Triggers

Always define when the skill should NOT activate:

```markdown
Do NOT use for general writing, copywriting, or non-LLM-facing content.
Do NOT trigger when the user is just editing markdown without prompt intent.
```

### Body Under 5000 Tokens

The full SKILL.md loads into context on activation. Keep it focused. Move detailed reference material into `references/` and point the agent there explicitly:

```markdown
For the full API reference, read [references/api-spec.md](references/api-spec.md).
```

### Progressive Disclosure Pattern

```
SKILL.md (always-load)
  ├── Core workflow (steps 1-N)
  ├── Rules & constraints
  └── Pointers to references/

references/ (load on demand)
  ├── advanced-config.md
  ├── error-patterns.md
  └── examples/
```

### Mandatory Sections for Skills

Every SKILL.md should have at minimum:

1. **Purpose** — one paragraph on what the skill does
2. **When to use / When NOT to use** — activation guidance
3. **Workflow** — numbered steps the agent follows
4. **Rules** — constraints, gotchas, common mistakes
5. **Verification** — how to check the output is correct

---

## Prompt Review Checklist

When reviewing or auditing any prompt artifact, evaluate against:

### Structure
- [ ] Sections follow Context → Task → Format → Constraints → Examples
- [ ] Clear delimiters separate distinct sections
- [ ] Consistent heading hierarchy

### Clarity
- [ ] Instructions are explicit and specific (not "handle appropriately")
- [ ] Terminology is consistent throughout
- [ ] No ambiguous pronouns or references

### Completeness
- [ ] Negative constraints defined (what NOT to do)
- [ ] Edge cases addressed
- [ ] Error/failure handling specified
- [ ] Output format defined with examples

### Safety
- [ ] No conflicting requirements
- [ ] No assumptions about model knowledge without verification
- [ ] Escape hatches for unexpected inputs
- [ ] Not brittle to minor input variations

### Efficiency
- [ ] No redundant instructions
- [ ] Not over-engineered for the task complexity
- [ ] Heavy reference material externalized (for skills)

---

## Anti-Patterns

Watch for these failure modes when designing or reviewing prompts:

| Anti-Pattern | Problem | Fix |
|---|---|---|
| **Wall of Text** | Model loses important instructions in noise | Use headings, tables, numbered steps |
| **Conflicting Rules** | "Be concise" + "Include all details" | Prioritize or scope each rule |
| **Implicit Expectations** | "Format it properly" without specifying format | Add concrete output example |
| **Kitchen Sink** | One prompt tries to do everything | Split into chained prompts or separate skills |
| **Premature Optimization** | Complex CoT/ToT for a simple extraction task | Start simple, add complexity only when needed |
| **Missing Verification** | No way to check if output is correct | Add verification step or self-check instruction |
| **Vague Description** (skills) | "Helps with X" — never triggers | List specific trigger phrases and input types |

---

## Deliverables

Match the artifact type to what the user needs:

| Artifact | When |
|---|---|
| **System Prompt** | Defining agent identity, behavior, and constraints |
| **Task Prompt** | One-shot focused operation |
| **SKILL.md** | Reusable, discoverable agent capability |
| **Prompt Template** | Parameterized prompt with `{{variable}}` placeholders |
| **Evaluation Suite** | Test cases with expected outputs for validation |
| **Optimization Report** | Analysis of existing prompt with improvement recommendations |

---

## Output Standards

All prompt artifacts produced must have:

- Clear section delineation with headers and delimiters
- Explicit instruction ordering (context → task → format → constraints)
- Examples covering typical and edge cases
- Escape hatches for unexpected inputs
- Inline comments explaining non-obvious design decisions (use `<!-- -->` or `> Note:`)
