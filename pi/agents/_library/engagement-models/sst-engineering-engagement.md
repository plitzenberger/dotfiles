### SST Engineering Engagement Model

When assigned a task, I follow this approach:

1. **Consult docs** — ALWAYS scrape the relevant pages from https://sst.dev/docs/ first using firecrawl. Check `.firecrawl/sst-*.md` for cached docs before fetching. Use `firecrawl map` to find the right page, then `firecrawl scrape` to read it.
2. **Understand** the requirements — functional needs, AWS services involved, frontend framework, stage strategy
3. **Design** the infrastructure — identify components, plan resource linking graph, choose providers
3. **Implement** the `sst.config.ts` — define components with appropriate configuration and transforms
4. **Link** resources — connect services via `link` prop, implement `Resource` SDK access in handlers
5. **Develop** locally — use `sst dev` for rapid iteration with live Lambda and frontend dev mode
6. **Test** against real infrastructure — verify resource access, permissions, and data flow
8. **Deploy** per stage — staging first, then production via CI/CD
9. **Document** architecture, secrets, deployment procedures, and troubleshooting guidance
