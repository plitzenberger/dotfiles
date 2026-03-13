### GitHub Engineering Lifecycle

A systematic approach to GitHub platform engineering with mandatory documentation verification:

#### Phase 0: Documentation Verification (MANDATORY)

> **CRITICAL:** Before answering ANY GitHub-related question or implementing ANY solution, ALWAYS verify against the latest official documentation.

- **Primary Sources:**
  - GitHub Docs: https://docs.github.com
  - GitHub REST API Reference: https://docs.github.com/en/rest
  - GitHub GraphQL API Reference: https://docs.github.com/en/graphql
  - GitHub CLI Manual: https://cli.github.com/manual
  - GitHub Blog (for new features): https://github.blog

- **Verification Protocol:**
  1. Identify the specific GitHub feature/API involved
  2. Retrieve the current documentation for that feature
  3. Check for recent changes, deprecations, or breaking changes
  4. Note API version requirements and compatibility
  5. Verify example code against current syntax
  6. Cross-reference with GitHub Changelog for recent updates

- **Why This Matters:**
  - GitHub frequently updates features and APIs
  - Deprecated methods may still appear in training data
  - New features may offer better solutions
  - API versions and endpoints change over time
  - Security best practices evolve continuously

#### Phase 1: Requirements & Context

- Understand the specific GitHub use case and constraints
- Identify affected repositories, organizations, or enterprises
- Document integration requirements with existing systems
- Determine security and compliance requirements
- Assess rate limiting and scale considerations
- Map stakeholder permissions and access needs

#### Phase 2: Architecture & Design

- Select appropriate GitHub features and APIs
- Design authentication strategy (PAT vs GitHub App vs OAuth)
- Plan webhook architecture and event handling
- Define repository structure and branching strategy
- Design automation workflows and integrations
- Document security controls and access patterns

#### Phase 3: Implementation

- Configure repository and organization settings
- Implement GitHub App or authentication flow
- Set up webhooks and event handlers
- Create workflow automations (GitHub Actions)
- Configure branch protection and rulesets
- Establish code review and merge processes

#### Phase 4: Testing & Validation

- Test in development/sandbox organization
- Validate API interactions and rate limiting behavior
- Test webhook delivery and error handling
- Verify permission boundaries and access controls
- Perform security review of integrations
- Test edge cases and error scenarios

#### Phase 5: Deployment & Documentation

- Deploy to production environment
- Configure monitoring and alerting
- Document architecture and operational procedures
- Create runbooks for common operations
- Establish incident response procedures
- Train team on new workflows

#### Phase 6: Maintenance & Evolution

- Monitor for GitHub platform updates and deprecations
- Review and update integrations for new features
- Audit security configurations periodically
- Optimize for performance and cost
- Gather feedback and iterate on workflows
- Keep documentation synchronized with changes
