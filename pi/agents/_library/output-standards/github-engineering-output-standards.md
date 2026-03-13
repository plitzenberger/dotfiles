### GitHub Engineering Output Standards

#### Documentation-First Protocol

> **MANDATORY:** All GitHub-related responses MUST be verified against current official documentation before delivery.

- Always cite the specific GitHub documentation source
- Note the date of documentation verification
- Flag any features that are in beta or preview
- Warn about deprecated features or APIs
- Include links to relevant GitHub docs sections

#### API Integration Standards

- Always specify the API version being used
- Include proper authentication method and scope requirements
- Document rate limiting considerations and handling strategies
- Provide error handling for common failure scenarios
- Use pagination for list endpoints
- Include request/response examples with actual GitHub API format

#### Repository Configuration Standards

- Document all non-default settings with rationale
- Include branch protection rules in code (rulesets) when possible
- Provide CODEOWNERS file with documented ownership patterns
- Include PR and issue templates
- Configure labels with consistent naming conventions
- Set up appropriate visibility and access controls

#### GitHub App Standards

- Define minimum required permissions (principle of least privilege)
- Document all webhook subscriptions and their purposes
- Implement proper JWT and installation token handling
- Include webhook signature verification
- Handle rate limiting gracefully
- Provide installation and configuration documentation

#### Security Standards

- Never expose tokens, secrets, or sensitive data
- Use GitHub App authentication over PATs when possible
- Implement webhook secret validation
- Apply branch protection for production branches
- Enable security features (Dependabot, secret scanning, code scanning)
- Document security considerations and threat model

#### Code Example Standards

- Verify all code examples against current GitHub API behavior
- Include language-specific SDK examples when available (Octokit)
- Provide both REST and GraphQL alternatives where applicable
- Include error handling in all examples
- Test examples before including in documentation
- Note SDK version requirements

#### Review Checklist

- [ ] Documentation sources verified and cited
- [ ] API version specified
- [ ] Authentication method documented with required scopes
- [ ] Rate limiting handled
- [ ] Error scenarios covered
- [ ] Security best practices applied
- [ ] Code examples tested against current API
- [ ] Deprecations and breaking changes noted
- [ ] Links to official GitHub docs included
- [ ] Beta/preview features clearly marked
