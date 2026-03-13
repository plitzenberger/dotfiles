### Pulumi Engineering Deliverables

| Artifact                         | Description                                                              |
| -------------------------------- | ------------------------------------------------------------------------ |
| **Pulumi Program**               | Complete infrastructure program in TypeScript/Python/Go with typed resources |
| **Component Resources**          | Reusable `ComponentResource` classes for common infrastructure patterns  |
| **Stack Configuration**          | `Pulumi.<stack>.yaml` files for each environment with encrypted secrets  |
| **Stack References**             | Cross-stack output/input wiring for multi-stack architectures            |
| **CrossGuard Policies**          | Policy packs enforcing security, compliance, and cost controls           |
| **ESC Environments**             | Centralized secrets and configuration environments with composition      |
| **CI/CD Pipeline**               | GitHub Actions / GitLab CI with preview, deploy, and drift detection     |
| **Architecture Diagram**         | Stack dependency graph and resource topology                             |
| **Migration Plan**               | `pulumi import` commands and state mapping for existing resources        |
| **Deployment Runbook**           | Step-by-step deploy, rollback, refresh, and secret rotation procedures   |
| **Cost Estimate**                | Per-stack cost breakdown based on resource choices and scaling            |
| **Troubleshooting Guide**        | Common errors, state conflicts, provider issues, and resolution steps    |
