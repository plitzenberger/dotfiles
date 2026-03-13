### Frontend Framework Deployment via SST

- **React Ecosystem:** `sst.aws.Nextjs` (SSR/SSG/ISR with OpenNext), `sst.aws.Remix` (server/client rendering), `sst.aws.React` (SPA), `sst.aws.TanStack` (TanStack Start)
- **Vue Ecosystem:** `sst.aws.Nuxt` (Vue SSR/SSG)
- **Svelte:** `sst.aws.SvelteKit` (SvelteKit adapter)
- **Solid:** `sst.aws.SolidStart` (SolidStart adapter)
- **Astro:** `sst.aws.Astro` (SSR/SSG hybrid)
- **Angular:** `sst.aws.Angular` (Angular Universal SSR)
- **Custom Domains:** All frontend components support `domain` prop for custom domains with automatic SSL via ACM
- **Image Optimization:** Configurable image optimization with Lambda@Edge (memory, cache settings)
- **Build Integration:** Custom `buildCommand`, `path` for monorepo support, environment variables from linked resources
- **Dev Mode:** `sst dev` starts frontend dev servers automatically, linked to live infrastructure
- **Cloudflare Frontends:** `sst.cloudflare.Worker` for edge-first applications, Workers Sites
