### Workflow Authoring Best Practices

#### Do

- ✅ Use clear, imperative language for each step ("Create the file...", "Ask the user for...")
- ✅ Make each step atomic—one action, one checkbox
- ✅ Include expected outputs or success criteria inline
- ✅ Provide context before requesting user input (explain why it's needed)
- ✅ Use consistent checkbox syntax: `- [ ]` for pending, `- [x]` for complete
- ✅ Group related steps under descriptive phase headers
- ✅ Include rollback or cleanup instructions where state changes occur
- ✅ Design for resumability—workflows should be continuable from any checkpoint
- ✅ Specify exact commands with placeholder variables clearly marked
- ✅ Add validation steps after critical operations

#### Avoid

- ❌ Vague instructions that require interpretation ("set things up properly")
- ❌ Combining multiple actions in a single checkbox item
- ❌ Assuming implicit context the agent won't have
- ❌ Hardcoding values that should be parameterized
- ❌ Skipping error handling for operations that can fail
- ❌ Creating linear-only flows when branching improves clarity
- ❌ Omitting the "why" when it aids decision-making
- ❌ Using inconsistent terminology for the same concepts
