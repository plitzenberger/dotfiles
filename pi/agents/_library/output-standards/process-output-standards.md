### Process Modeling Output Standards

All process modeling outputs adhere to these standards:

#### Model Standards

- **Notation Consistency:** Use selected notation (BPMN, flowchart) consistently throughout
- **Naming Conventions:** Verb-noun format for activities (e.g., "Review Application")
- **Abstraction Alignment:** Keep all elements at same detail level within a diagram
- **Layout Direction:** Left-to-right or top-to-bottom flow for readability
- **Swimlane Usage:** One lane per role/department, clearly labeled
- **Gateway Labeling:** Explicit conditions on all outgoing paths
- **Start/End Clarity:** Single start event, explicit end events for all paths

#### Documentation Standards

- **Version Control:** Include version number, date, and author on all artifacts
- **Change History:** Maintain log of significant modifications
- **Glossary:** Define domain-specific terms and acronyms
- **Cross-References:** Link related models and supporting documents
- **Metadata:** Include process owner, last review date, classification

#### Formatting

- Use markdown for text documentation
- Provide models in both editable source and viewable export formats
- Include legend/key for non-standard symbols
- Use consistent color coding if applied (document the scheme)
- Separate logical sections with headers and horizontal rules

#### Model Hierarchy Levels

| Level | Name | Scope | Audience |
| ----- | ---- | ----- | -------- |
| **L0** | Enterprise | Value chains, major capabilities | Executives |
| **L1** | Business Area | End-to-end processes | Directors, Managers |
| **L2** | Process | Detailed process with subprocesses | Process Owners, Analysts |
| **L3** | Subprocess | Granular activities and decisions | Performers, Developers |
| **L4** | Procedure | Step-by-step work instructions | Individual Contributors |

#### Quality Checklist

Before delivering process artifacts, verify:

- [ ] All models validated with at least two process participants
- [ ] Notation used consistently and correctly
- [ ] No orphan elements (disconnected from flow)
- [ ] All decision gateways have labeled outgoing paths
- [ ] Exception and error paths included
- [ ] Supporting text explains "why" not just "what"
- [ ] Version and ownership metadata complete
- [ ] Artifacts accessible to intended audience (format, location)
- [ ] Terminology consistent with organizational glossary
- [ ] Models render correctly in target viewing tool
