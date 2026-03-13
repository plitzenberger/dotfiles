### CI/CD Tools

#### GitHub Actions Ecosystem

| Tool                        | Best For                                                              |
| --------------------------- | --------------------------------------------------------------------- |
| actions/checkout            | Repository checkout with submodules, sparse checkout, and LFS        |
| actions/setup-node          | Node.js version management with caching                               |
| actions/cache               | Dependency and build artifact caching                                 |
| actions/upload-artifact     | Sharing data between jobs and workflows                               |
| github/codeql-action        | Static analysis and security scanning                                 |
| docker/build-push-action    | Container image building and registry publishing                      |
| hashicorp/setup-terraform   | Terraform CLI installation and authentication                         |
| aws-actions/configure-aws   | AWS credential configuration via OIDC                                 |

#### Debugging & Local Development

| Tool                        | Best For                                                              |
| --------------------------- | --------------------------------------------------------------------- |
| nektos/act                  | Run GitHub Actions locally without pushing to repository              |
| ACTIONS_STEP_DEBUG          | Enable debug logging by setting repository secret to `true`           |
| ACTIONS_RUNNER_DEBUG        | Enable runner diagnostic logging for troubleshooting                  |
| Workflow visualization      | GitHub's built-in graph view for job dependencies and status          |
| ::debug::, ::warning::      | Step annotation commands for structured log output                    |
| hashicorp/vault-action      | Secrets retrieval from HashiCorp Vault in workflows                   |

#### Build & Package Management

| Tool                  | Best For                                                              |
| --------------------- | --------------------------------------------------------------------- |
| npm/yarn/pnpm         | JavaScript dependency management and scripts                         |
| pip/poetry/uv         | Python package management                                             |
| Maven/Gradle          | Java build and dependency management                                  |
| cargo                 | Rust package management and builds                                    |
| go mod                | Go module management                                                  |

#### Container & Orchestration

| Tool                  | Best For                                                              |
| --------------------- | --------------------------------------------------------------------- |
| Docker                | Container building, multi-stage builds, local development             |
| Docker Compose        | Multi-container application testing                                   |
| Kubernetes            | Container orchestration, helm chart deployment                        |
| ArgoCD                | GitOps continuous delivery to Kubernetes                              |

#### Infrastructure as Code

| Tool                  | Best For                                                              |
| --------------------- | --------------------------------------------------------------------- |
| Terraform             | Multi-cloud infrastructure provisioning                               |
| Pulumi                | Infrastructure as code with general-purpose languages                 |
| AWS CDK               | AWS infrastructure with TypeScript/Python                             |
| CloudFormation        | AWS-native infrastructure templates                                   |

#### Security & Compliance

| Tool                  | Best For                                                              |
| --------------------- | --------------------------------------------------------------------- |
| Dependabot            | Dependency vulnerability alerts and automatic updates                 |
| Snyk                  | Application and container security scanning                           |
| Trivy                 | Container image and IaC vulnerability scanning                        |
| OSSF Scorecard        | Open source project security posture assessment                       |
| Sigstore/cosign       | Container image signing and verification                              |

#### Testing & Quality

| Tool                  | Best For                                                              |
| --------------------- | --------------------------------------------------------------------- |
| Jest/Vitest           | JavaScript/TypeScript unit testing                                    |
| pytest                | Python testing with fixtures                                          |
| Playwright/Cypress    | End-to-end browser testing                                            |
| k6/Artillery          | Load testing and performance benchmarks                               |
| SonarCloud            | Code quality and security analysis                                    |

#### Deployment & Release

| Tool                  | Best For                                                              |
| --------------------- | --------------------------------------------------------------------- |
| semantic-release      | Automated versioning and changelog generation                         |
| Vercel/Netlify        | Frontend deployment with preview environments                         |
| Railway/Render        | Backend deployment with automatic scaling                             |
| AWS ECS/Lambda        | Serverless and container deployment on AWS                            |
