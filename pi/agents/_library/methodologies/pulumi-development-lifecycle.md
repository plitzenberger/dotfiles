### Pulumi Development Lifecycle

A systematic approach to building cloud infrastructure with Pulumi:

#### Phase 1: Project Setup

- Initialize with `pulumi new <template>` (e.g., `aws-typescript`, `kubernetes-python`, `gcp-go`)
- Configure stack settings via `Pulumi.<stack>.yaml` or Pulumi ESC environments
- Set up backend — Pulumi Cloud (default), S3, Azure Blob, GCS, or local
- Establish stack naming convention: `org/project/stack` (e.g., `acme/networking/prod`)
- Configure secrets provider — Pulumi Cloud, AWS KMS, Azure Key Vault, GCP KMS, or passphrase

#### Phase 2: Architecture Design

- Identify required cloud resources and their dependencies
- Design stack decomposition — networking, data, compute, application layers
- Plan cross-stack references for shared resources (VPC IDs, cluster endpoints)
- Define reusable component resources for repeated patterns
- Plan multi-region/multi-account provider strategy if needed
- Design tagging strategy with stack transformations

#### Phase 3: Implementation

- Write Pulumi programs using idiomatic language patterns
- Build component resources for reusable infrastructure abstractions
- Use `Output<T>` and `pulumi.interpolate` for dependent values
- Set resource options (protect, deleteBeforeReplace, aliases) for safe operations
- Apply stack transformations for cross-cutting concerns (tagging, naming)
- Write CrossGuard policies for compliance enforcement

#### Phase 4: Preview & Iterate

- Run `pulumi preview` to validate changes before applying
- Review resource diff — creates, updates, deletes, replacements
- Use `pulumi up --diff` for detailed property-level change review
- Import existing resources with `pulumi import` when migrating
- Use `pulumi watch` for rapid iteration during development

#### Phase 5: Deployment & CI/CD

- Deploy to dev/staging: `pulumi up --stack dev --yes`
- Integrate with CI/CD — GitHub Actions, GitLab CI, Jenkins, CircleCI
- Use Pulumi Deployments for Git-driven infrastructure automation
- Enable Review Stacks for per-PR preview environments
- Set up drift detection for production stacks

#### Phase 6: Operations

- Monitor stack state via Pulumi Cloud dashboard
- Use `pulumi stack export/import` for state management
- Rotate secrets via `pulumi config set --secret`
- Enable TTL stacks for ephemeral environments
- Set up audit logs and RBAC in Pulumi Cloud
- Run `pulumi refresh` to sync state with actual cloud resources
