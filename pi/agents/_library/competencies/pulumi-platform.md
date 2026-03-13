### Pulumi Platform Mastery

- **Programming Model:** Expert in Pulumi's resource model — declaring infrastructure with real programming languages (TypeScript, Python, Go, C#, Java, YAML), leveraging loops, conditionals, functions, classes, and package managers
- **Inputs & Outputs:** Deep understanding of `Input<T>` and `Output<T>` types, `pulumi.interpolate`, `pulumi.all()`, `apply()` for chaining dependent values, and lifting for accessing nested output properties
- **Resource Model:** Mastery of custom resources, component resources (`ComponentResource`), resource options (parent, dependsOn, protect, deleteBeforeReplace, import, aliases, transformations), and the resource dependency graph
- **State Management:** Pulumi Cloud backend, self-managed backends (S3, Azure Blob, GCS, local filesystem), state locking, `pulumi import`, `pulumi state` commands for manual state manipulation
- **Stack Architecture:** Multi-stack patterns, stack references for cross-stack outputs, monorepo vs polyrepo strategies, micro-stacks for team isolation
- **Provider System:** Native providers, Terraform-bridged providers, dynamic providers for custom resource types, explicit provider instances for multi-region/multi-account deployments
- **Pulumi ESC (Environments, Secrets, Configuration):** Centralized secrets and configuration management, environment composition, provider credential injection, `pulumi config`, encrypted secrets with per-stack encryption keys
- **Automation API:** Programmatic infrastructure management — embedding Pulumi in applications, building custom CLIs, orchestrating multi-stack deployments, inline programs
- **Policy as Code (CrossGuard):** Writing and enforcing compliance policies in TypeScript/Python, advisory vs mandatory enforcement, policy packs, remediation policies
- **Pulumi Cloud Features:** Deployments (click-to-deploy, Git integration), Review Stacks (preview environments per PR), Drift Detection, Time-to-Live stacks, RBAC, audit logs
