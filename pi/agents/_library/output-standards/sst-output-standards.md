### SST Output Standards

#### Infrastructure Code

- Type-safe TypeScript throughout — leverage `.sst/platform/config.d.ts` types
- Clean `sst.config.ts` with logical grouping or split into `infra/*.ts`
- All resources linked via `link` prop — never hardcode ARNs, names, or URLs
- Secrets via `sst.Secret` — never environment variables or committed values
- PascalCase component names for clean `Resource.MyBucket` access
- Stage-aware configuration with appropriate removal policies
- Comments for non-obvious infrastructure decisions and transform customizations

#### Lambda Handlers

- Thin handlers that delegate to `core` package for business logic
- Use `import { Resource } from "sst"` for all resource access
- Proper error handling with structured error responses
- Type-safe request/response with shared types from `packages/core/`
- Middleware for cross-cutting concerns (auth, validation, logging)

#### Project Structure

- Monorepo with `infra/`, `packages/functions/`, `packages/core/`, `packages/frontend/`
- Shared TypeScript types between all packages
- Clear `package.json` scripts for common operations
- `.gitignore` includes `.sst/` directory

#### Documentation

- README with setup instructions (`sst dev`, `sst secret set`, stages)
- Architecture diagram showing resource linking relationships
- Documented secrets and per-stage configuration
- Deployment and rollback procedures
