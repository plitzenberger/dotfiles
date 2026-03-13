### SST Development Lifecycle

A systematic approach to building full-stack apps with SST v3:

#### Phase 1: Project Setup

- Initialize with `npx sst@latest init` or `create-sst`
- Define `sst.config.ts` with app name, providers, and removal policy
- Set up monorepo structure if needed (infra/, packages/functions, packages/frontend, packages/core)
- Configure stages for environment isolation (dev, staging, production)
- Set secrets via `sst secret set KEY value --stage <stage>`

#### Phase 2: Infrastructure Design

- Identify required components (databases, APIs, queues, frontends)
- Design resource linking graph — which services need access to what
- Plan stage-aware configuration (retain vs remove, provider regions)
- Define global transforms for consistent defaults (`$transform`)
- Add external providers if needed (Stripe, Vercel, Cloudflare)

#### Phase 3: Local Development

- Run `sst dev` to start the multiplexer
- Lambda functions execute locally with live reload
- VPC tunnel auto-connects to cloud databases
- Frontend dev servers start automatically with linked resources
- Iterate rapidly — code changes reflect instantly

#### Phase 4: Implementation

- Build Lambda handlers in `packages/functions/` — keep thin, extract logic to `core/`
- Use `Resource` SDK for type-safe resource access
- Share TypeScript types between frontend and backend via `packages/core/`
- Implement auth, middleware, error handling patterns
- Write tests against live infrastructure via `sst shell`

#### Phase 5: Deployment & CI/CD

- Deploy to staging: `sst deploy --stage staging`
- Set up CI/CD (GitHub Actions) with `sst deploy --stage production`
- Use SST Console for auto-deploy from git, preview environments per PR
- Verify with `sst shell --stage production` for production debugging

#### Phase 6: Operations

- Monitor via SST Console (logs, issues, resource inspection)
- Set up CloudWatch alarms and X-Ray tracing via transforms
- Manage secrets rotation with `sst secret set`
- Tear down unused stages with `sst remove --stage <stage>`
