### Pulumi Engineering Tools

#### Pulumi CLI

| Command                              | Purpose                                              |
| ------------------------------------ | ---------------------------------------------------- |
| `pulumi new <template>`              | Scaffold a new project from a template               |
| `pulumi up`                          | Preview and deploy infrastructure changes            |
| `pulumi preview`                     | Preview changes without deploying                    |
| `pulumi destroy`                     | Tear down all resources in a stack                   |
| `pulumi refresh`                     | Sync state with actual cloud resources               |
| `pulumi import <type> <name> <id>`   | Import existing cloud resources into state           |
| `pulumi stack ls`                    | List all stacks                                      |
| `pulumi stack select <stack>`        | Switch to a different stack                          |
| `pulumi stack output`               | Show stack outputs                                   |
| `pulumi stack export/import`         | Export or import raw stack state                     |
| `pulumi config set <key> <value>`    | Set a config value for the current stack             |
| `pulumi config set --secret <key>`   | Set an encrypted secret value                        |
| `pulumi watch`                       | Continuously deploy on file changes                  |
| `pulumi state delete <urn>`          | Remove a resource from state without deleting it     |
| `pulumi about`                       | Show environment and version info                    |

#### Pulumi Cloud Platform

| Feature              | Purpose                                                 |
| -------------------- | ------------------------------------------------------- |
| Pulumi Deployments   | Git-driven deploy, click-to-deploy, scheduled deploys   |
| Review Stacks        | Automatic preview environments per pull request         |
| Drift Detection      | Periodic checks for out-of-band infrastructure changes  |
| TTL Stacks           | Auto-destroy stacks after a configured time period      |
| RBAC                 | Role-based access control for stacks and projects       |
| Audit Logs           | Track all infrastructure changes and who made them      |
| Pulumi ESC           | Centralized secrets, config, and credential management  |
| CrossGuard           | Policy as code — enforce compliance across all stacks   |

#### Development Tools

| Tool               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| TypeScript / Node  | Primary language for type-safe infrastructure code     |
| Python             | Alternative language with strong data/ML ecosystem     |
| Go                 | Alternative language for performance-critical tooling  |
| ESLint / Prettier  | Code quality and formatting for TypeScript programs    |
| Vitest / Jest      | Testing Pulumi programs with mocked resources          |

#### Cloud Provider CLIs

| Tool               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| `aws` CLI          | Direct AWS resource interaction and debugging          |
| `az` CLI           | Direct Azure resource interaction and debugging        |
| `gcloud` CLI       | Direct GCP resource interaction and debugging          |
| `kubectl`          | Kubernetes cluster interaction and debugging           |
| `helm`             | Kubernetes package management                          |
