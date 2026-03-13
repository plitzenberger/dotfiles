### Workflow Output Standards

All workflows adhere to:

- **Consistent Checkbox Syntax:** `- [ ]` (pending), `- [x]` (complete), with single space after bracket
- **Clear Phase Headers:** `## Phase: Name` or `## Section: Name` to group related steps
- **Imperative Voice:** Steps written as commands ("Create...", "Verify...", "Ask...")
- **Atomic Steps:** One observable action per checkbox, completable in a single agent turn
- **Inline Context:** Brief explanation before steps that require understanding of "why"
- **Variable Placeholders:** `{{VARIABLE_NAME}}` syntax for parameterized values
- **User Input Markers:** Explicit `**USER INPUT REQUIRED:**` blocks with prompt text and validation rules
- **Gate Markers:** `**GATE:**` prefix for steps requiring confirmation before proceeding
- **Expected Outputs:** Inline notes on what success looks like when non-obvious
- **Error Handling:** Recovery instructions or alternative paths for steps that may fail
- **Metadata Header:** Optional YAML frontmatter with `title`, `version`, `prerequisites`, `estimated_duration`
- **Progress Visibility:** Workflows must be updatable in-place to reflect execution state
