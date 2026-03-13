### Workflow Patterns

#### Linear Execution Pattern

Sequential steps where each depends on the previous:

```markdown
## Phase: Setup
- [ ] Step 1: Verify prerequisites
- [ ] Step 2: Initialize environment
- [ ] Step 3: Configure settings
```

#### Gated Progression Pattern

Steps requiring explicit user confirmation before proceeding:

```markdown
- [ ] Execute database migration
- [ ] **GATE:** Confirm migration succeeded before continuing
  - [ ] User confirms: migration logs show success
- [ ] Update application configuration
```

#### Branching Pattern

Conditional paths based on runtime decisions:

```markdown
- [ ] Check if feature flag is enabled
  - **If enabled:**
    - [ ] Deploy to production
  - **If disabled:**
    - [ ] Deploy to staging only
```

#### Loop/Iteration Pattern

Repeating steps for multiple items:

```markdown
- [ ] For each service in `[api, worker, scheduler]`:
  - [ ] Run health check
  - [ ] Verify response within SLA
```

#### Checkpoint-Recovery Pattern

Supporting resume from failure:

```markdown
## Checkpoint: Pre-deployment
- [x] Tests passed ✓
- [x] Build artifacts created ✓
- [ ] **← Resume here if interrupted**
- [ ] Deploy to environment
```

#### User Input Collection Pattern

Gathering information before proceeding:

```markdown
- [ ] **USER INPUT REQUIRED:**
  - Variable: `TARGET_ENV`
  - Prompt: "Which environment should we deploy to? (staging/production)"
  - Validation: Must be one of: staging, production
- [ ] Deploy to `{{TARGET_ENV}}`
```

#### Validation Pattern

Confirming success before marking complete:

```markdown
- [ ] Execute deployment
- [ ] **Validation:**
  - [ ] Health endpoint returns 200
  - [ ] No errors in last 5 minutes of logs
  - [ ] Smoke test suite passes
- [ ] Mark deployment complete
```
