### SST Engineering Tools

#### SST CLI

| Command                          | Purpose                                              |
| -------------------------------- | ---------------------------------------------------- |
| `sst dev`                        | Local dev — multiplexer, live Lambda, VPC tunnel     |
| `sst deploy --stage <stage>`     | Deploy to a stage                                    |
| `sst remove --stage <stage>`     | Tear down a stage                                    |
| `sst shell`                      | REPL with linked resources available                 |
| `sst secret set KEY value`       | Set a secret value for current stage                 |
| `sst secret list`                | List all secrets for current stage                   |
| `sst install`                    | Regenerate types after config changes                |
| `sst diff`                       | Preview infrastructure changes before deploy         |
| `npx sst@latest init`           | Initialize SST in an existing project                |

#### Development Tools

| Tool               | Purpose                                                |
| ------------------ | ------------------------------------------------------ |
| TypeScript         | Type safety across infrastructure and application code |
| esbuild            | Fast Lambda function bundling (built into SST)         |
| Vitest / Jest      | Testing framework for Lambda handlers and core logic   |
| ESLint / Prettier  | Code quality and formatting                            |
| SST Console        | Auto-deploy, preview environments, monitoring          |

#### AWS Tools

| Tool                | Purpose                                               |
| ------------------- | ----------------------------------------------------- |
| AWS CLI             | Direct AWS resource interaction and debugging         |
| CloudWatch Logs     | Lambda execution logs (also visible in `sst dev`)     |
| AWS X-Ray           | Distributed tracing across Lambda and services        |
| CloudFormation      | Stack event debugging for failed deployments          |
| IAM Policy Simulator| Verify permissions when customizing via transforms    |

#### Monitoring & Observability

| Tool              | Purpose                                                 |
| ----------------- | ------------------------------------------------------- |
| SST Console       | Real-time logs, issues, and resource monitoring         |
| CloudWatch Alarms | Automated alerting on metrics thresholds                |
| Sentry / Datadog  | Error tracking and APM integration via Lambda layers    |
| X-Ray             | End-to-end request tracing                              |
