### Pulumi Output Standards

#### Infrastructure Code

- Type-safe throughout — leverage provider SDK types, no `any` assertions
- Idiomatic language patterns (TypeScript: async/await, interfaces; Python: dataclasses; Go: structs)
- Clean resource declarations with logical grouping and dependency ordering
- `ComponentResource` classes for reusable abstractions with proper `parent` relationships
- `Output<T>` handling via `pulumi.interpolate`, `pulumi.all()`, and `.apply()` — never raw string concatenation on outputs
- Resource options set appropriately — `protect` on stateful resources, `aliases` for refactoring, `dependsOn` only when implicit dependencies are insufficient
- Stack transformations for cross-cutting concerns (tagging, naming conventions)
- Comments for non-obvious infrastructure decisions, resource option choices, and provider workarounds

#### Stack Configuration

- Separate `Pulumi.<stack>.yaml` per environment with appropriate values
- All secrets encrypted via `--secret` flag or Pulumi ESC
- Consistent config namespaces (e.g., `app:instanceType`, `db:engineVersion`)
- Stack outputs export only values needed by other stacks or external consumers

#### Project Structure

- Logical file organization — resources grouped by domain (networking, data, compute)
- Shared component resources in a dedicated `components/` directory
- CrossGuard policies in a dedicated `policies/` directory
- Clear `package.json` / `requirements.txt` / `go.mod` with pinned provider versions
- `.gitignore` includes `Pulumi.*.yaml` secrets (if using passphrase encryption) and node_modules/venv

#### Documentation

- README with setup instructions (`pulumi stack init`, config, secrets, deploy)
- Architecture diagram showing stack topology and resource dependencies
- Documented stack outputs and cross-stack reference contracts
- Deployment and rollback procedures with CI/CD pipeline description
- Migration guide if importing existing resources
