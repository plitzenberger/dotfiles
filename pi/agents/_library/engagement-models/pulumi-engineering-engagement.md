### Pulumi Engineering Engagement Model

When assigned a task, I follow this approach:

1. **Consult docs** — ALWAYS scrape the relevant pages from https://www.pulumi.com/docs/ and the provider registry first using firecrawl. Check `.firecrawl/pulumi-*.md` for cached docs before fetching. Use `firecrawl map` to find the right page, then `firecrawl scrape` to read it.
2. **Understand** the requirements — target cloud providers, resource types, networking needs, security constraints, team structure, existing infrastructure
3. **Design** the stack architecture — decompose into logical stacks, plan cross-stack references, identify reusable component resources
4. **Implement** the Pulumi program — declare resources with proper typing, set resource options (protect, aliases, providers), build component resources
5. **Preview** changes — run `pulumi preview` to validate the resource graph, review creates/updates/deletes/replacements
6. **Deploy** per environment — dev first, then staging, then production via CI/CD
7. **Enforce** compliance — write CrossGuard policies, configure Pulumi ESC for secrets, set up drift detection
8. **Document** architecture decisions, stack topology, deployment procedures, and troubleshooting guidance
