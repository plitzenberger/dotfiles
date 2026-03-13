### Pulumi Engineering Best Practices

#### Infrastructure Code

- ✅ Use real programming language features — loops, conditionals, functions, classes
- ✅ Build reusable `ComponentResource` classes for repeated patterns
- ✅ Use `pulumi.interpolate` for string interpolation with outputs — never `.apply()` for simple concatenation
- ✅ Set `protect: true` on production databases, storage, and stateful resources
- ✅ Use `deleteBeforeReplace` when resources don't support in-place updates
- ✅ Use `aliases` when renaming or refactoring resources to preserve state
- ✅ Apply stack transformations for consistent tagging and naming
- ✅ Use explicit provider instances for multi-region/multi-account deployments
- ❌ Never use `any` types — leverage full type safety from provider SDKs
- ❌ Don't hardcode resource names — let Pulumi auto-name with physical name suffixes
- ❌ Don't use `.apply()` when `pulumi.interpolate` or `pulumi.all()` suffices

#### State & Configuration

- ✅ Use Pulumi Cloud or remote backends for team collaboration
- ✅ Encrypt secrets with `pulumi config set --secret` — never plaintext
- ✅ Use Pulumi ESC for centralized environment and secrets management
- ✅ Use stack configuration (`Pulumi.<stack>.yaml`) for environment-specific values
- ✅ Run `pulumi refresh` periodically to detect drift
- ❌ Never commit `Pulumi.<stack>.yaml` files with unencrypted secrets
- ❌ Don't manually edit state files — use `pulumi state` commands
- ❌ Don't share stacks between developers — each gets their own dev stack

#### Stack Architecture

- ✅ Decompose into logical stacks — networking, data, compute, app
- ✅ Use stack references for cross-stack dependencies
- ✅ Keep stacks small enough to deploy in under 10 minutes
- ✅ Use consistent stack naming: `org/project/env` (e.g., `acme/vpc/prod`)
- ✅ Export only values that other stacks need — minimize coupling
- ❌ Don't put everything in a single monolithic stack
- ❌ Don't create circular dependencies between stacks

#### Security

- ✅ Follow least-privilege IAM — scope permissions to specific resources
- ✅ Use Pulumi ESC for credential injection — never store credentials in config
- ✅ Write CrossGuard policies to enforce compliance (encryption, tagging, public access)
- ✅ Enable encryption at rest and in transit for all data stores
- ✅ Use VPCs and security groups for network isolation
- ❌ Never grant `*` permissions on IAM policies
- ❌ Don't expose databases or internal services to the public internet
- ❌ Don't disable default encryption on S3 buckets or EBS volumes

#### CI/CD & Operations

- ✅ Run `pulumi preview` in PR checks — surface changes before merge
- ✅ Deploy production only from CI/CD pipelines — never from local machines
- ✅ Use Pulumi Deployments or Review Stacks for automated infrastructure previews
- ✅ Enable drift detection on production stacks
- ✅ Set up TTL stacks for ephemeral dev/test environments
- ✅ Pin provider versions in `package.json` / `requirements.txt` / `go.mod`
- ❌ Don't run `pulumi up --yes` locally against production stacks
- ❌ Don't skip `pulumi preview` before deploying
