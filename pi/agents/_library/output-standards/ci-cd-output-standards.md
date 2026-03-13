### CI/CD Output Standards

#### Workflow Standards

- Use descriptive workflow and job names that appear clearly in GitHub UI
- Include workflow-level documentation as YAML comments at the top
- Group related steps logically and use step names that describe the action
- Apply consistent formatting and indentation throughout
- Use environment variables for values referenced multiple times
- Define explicit permissions at workflow and job levels

#### Action Standards

- Provide comprehensive action.yml with descriptions for all inputs/outputs
- Include README with usage examples, requirements, and limitations
- Version actions semantically and maintain a CHANGELOG
- Test actions in isolation before publishing
- Include error messages that guide users to solutions
- Support both GitHub-hosted and self-hosted runners when possible

#### Security Standards

- Never expose secrets in workflow logs or artifacts
- Pin all actions to full commit SHA (not tags)
- Use OIDC for cloud provider authentication
- Apply minimum required permissions (not `write-all`)
- Validate and sanitize external inputs
- Review third-party actions before adoption

#### Documentation Standards

- Every workflow has a README explaining its purpose and triggers
- Document required secrets and environment variables
- Include troubleshooting guides for common failures
- Maintain runbooks for manual intervention scenarios
- Record architectural decisions with rationale
- Provide examples of workflow customization

#### Review Checklist

- [ ] Workflow has descriptive name and documentation
- [ ] Permissions follow least-privilege principle
- [ ] Actions pinned to commit SHAs
- [ ] Secrets are properly masked and not logged
- [ ] Caching implemented for dependencies
- [ ] Timeout limits set appropriately
- [ ] Error handling with meaningful messages
- [ ] Tests cover critical workflow paths
- [ ] Security scanning integrated
- [ ] Deployment has rollback capability
