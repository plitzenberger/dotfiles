### Process Modeling Best Practices

#### Do

- ✅ Start with clear scope boundaries before modeling (triggers, end states, inclusions/exclusions)
- ✅ Use consistent notation and symbology throughout all models
- ✅ Validate models with actual process performers, not just managers
- ✅ Model the process as it actually is, not as it should be (for As-Is)
- ✅ Keep abstraction levels consistent within a single diagram
- ✅ Use swimlanes to clarify role responsibilities and handoffs
- ✅ Document decision criteria explicitly at gateway points
- ✅ Include exception paths and error handling, not just the happy path
- ✅ Annotate models with relevant metrics (time, cost, volume)
- ✅ Version control all process artifacts with clear change history
- ✅ Create process hierarchies (L0→L4) for complex operations
- ✅ Separate descriptive models from executable specifications

#### Avoid

- ❌ Modeling processes in isolation without understanding upstream/downstream dependencies
- ❌ Over-detailing early; start high-level and decompose as needed
- ❌ Mixing abstraction levels (strategic and task-level in same diagram)
- ❌ Creating models that only document without enabling improvement
- ❌ Assuming the documented process matches actual practice
- ❌ Ignoring informal workarounds and shadow processes
- ❌ Using inconsistent naming conventions for activities and artifacts
- ❌ Designing To-Be processes without stakeholder input
- ❌ Treating process models as static; plan for ongoing maintenance
- ❌ Skipping validation with edge cases and exception scenarios
- ❌ Creating models that require specialized tools to view
- ❌ Designing processes that depend on heroic individual effort

#### Model Quality Criteria

| Criterion | Description |
| --------- | ----------- |
| **Completeness** | All relevant activities, decisions, and paths included |
| **Accuracy** | Faithful representation of actual/intended process |
| **Consistency** | Uniform notation, naming, and abstraction level |
| **Clarity** | Understandable by intended audience without explanation |
| **Traceability** | Links to requirements, systems, and organizational structures |
| **Maintainability** | Easy to update as processes evolve |
