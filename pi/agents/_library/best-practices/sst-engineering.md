### SST Engineering Best Practices

#### Infrastructure

- ✅ Use SST built-in components before raw Pulumi resources
- ✅ Use `link` for all resource references — never hardcode ARNs, names, or URLs
- ✅ Use `sst.Secret` for sensitive values, never environment variables
- ✅ Use `transform` to customize — don't recreate components from scratch
- ✅ Set `removal: "retain"` for production databases and buckets
- ✅ Use PascalCase for component names (enables `Resource.MyBucket`)
- ✅ Component names must be globally unique across your entire app
- ❌ Never use v2 patterns (`StackContext`, `use()`, `bind()`, CDK constructs)
- ❌ Don't hardcode stage-specific values — use `input?.stage` conditionals

#### Code Organization

- ✅ Keep Lambda handlers thin — extract business logic to `packages/core/`
- ✅ Use `import { Resource } from "sst"` for type-safe resource access
- ✅ Share TypeScript types between frontend and backend
- ✅ Use monorepo structure for non-trivial apps (infra/, packages/)
- ✅ Split large `sst.config.ts` into `infra/*.ts` modules
- ✅ Use middleware for cross-cutting concerns (auth, logging, error handling)
- ❌ Don't put business logic in Lambda handlers directly
- ❌ Don't import infrastructure code in application code

#### Performance

- ✅ Right-size Lambda memory (directly affects CPU allocation)
- ✅ Minimize bundle size with tree-shaking and selective imports
- ✅ Use `sst.aws.Postgres` with RDS Proxy for connection pooling
- ✅ Cache at CloudFront and API Gateway level
- ✅ Use provisioned concurrency for latency-sensitive functions
- ❌ Don't use `sst.aws.Vpc` with NAT gateways unless required (expensive)
- ❌ Avoid large Lambda packages — they increase cold start duration

#### Security

- ✅ Rely on SST's automatic IAM permissions from `link` (least-privilege by default)
- ✅ Use `sst secret set` for all secrets — never commit to source
- ✅ Enable WAF on public-facing APIs via transforms
- ✅ Use VPC for database isolation
- ✅ Encrypt at rest and in transit (SST defaults handle most cases)
- ❌ Never grant `*` IAM permissions via transforms
- ❌ Don't expose internal error details in API responses

#### Stages & Deployment

- ✅ Use stages for environment isolation (`dev`, `staging`, `production`)
- ✅ Set different removal policies per stage
- ✅ Use `sst deploy --stage production` from CI/CD only
- ✅ Use SST Console for auto-deploy and preview environments
- ✅ Test with `sst shell` for REPL access to linked resources
- ❌ Don't deploy to production from local machines
- ❌ Don't share stages between developers — each gets their own
