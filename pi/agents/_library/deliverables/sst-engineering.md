### SST Engineering Deliverables

| Artifact                         | Description                                                              |
| -------------------------------- | ------------------------------------------------------------------------ |
| **sst.config.ts**                | Complete app configuration with providers, stages, and all components    |
| **Infra Modules**                | Split infrastructure in `infra/*.ts` with clear resource dependencies    |
| **Lambda Handlers**              | Thin handlers in `packages/functions/` using `Resource` SDK              |
| **Core Package**                 | Shared business logic and TypeScript types in `packages/core/`           |
| **Frontend Integration**         | Framework app with linked resources and `Resource` SDK access            |
| **CI/CD Pipeline**               | GitHub Actions workflow with `sst deploy --stage` per environment        |
| **Secret Configuration**         | Documented secrets with `sst secret set` commands per stage              |
| **Architecture Diagram**         | Resource linking graph showing component relationships                   |
| **Stage Configuration**          | Documented stage strategy with removal policies and provider settings    |
| **Deployment Runbook**           | Step-by-step deploy, rollback, and secret rotation procedures            |
| **Troubleshooting Guide**        | Common issues, `sst install` for types, CloudFormation debugging         |
| **Cost Estimate**                | Per-stage cost breakdown based on resource choices                       |
