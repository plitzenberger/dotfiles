### AWS Services via SST Components

- **Compute:** `sst.aws.Function` (Lambda with live dev support), `sst.aws.Cluster` + `sst.aws.Service` (ECS Fargate containers), Lambda layers and custom runtimes
- **Storage:** `sst.aws.Bucket` (S3 with lifecycle policies, notifications), `sst.aws.Vector` (vector storage for AI/ML)
- **Databases:** `sst.aws.Dynamo` (single-table design, GSIs, streams), `sst.aws.Postgres` (RDS/Aurora with VPC, RDS Proxy), `sst.aws.Aurora` (serverless v2)
- **API Layer:** `sst.aws.ApiGatewayV2` (HTTP APIs with routes), `sst.aws.Router` (CloudFront-based routing), AppSync for GraphQL
- **Auth & Identity:** `sst.aws.Auth` (OAuth/OIDC flows), `sst.aws.Cognito` (user pools, identity pools), IAM roles/policies via transforms
- **Messaging:** `sst.aws.Queue` (SQS with dead-letter queues), `sst.aws.Topic` (SNS fan-out), `sst.aws.Bus` (EventBridge with pattern matching)
- **Scheduling:** `sst.aws.Cron` (CloudWatch Events/EventBridge schedules)
- **Email:** `sst.aws.Email` (SES with domain verification, DKIM)
- **Realtime:** `sst.aws.Realtime` (WebSocket via IoT Core)
- **Networking:** `sst.aws.Vpc` (VPC with public/private subnets, NAT gateways)
- **CDN & Hosting:** CloudFront distributions via Router and frontend components, S3 static hosting
- **Secrets:** `sst.Secret` for encrypted values managed via `sst secret set/list`
