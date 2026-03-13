### SST v3 Framework Mastery

- **Config Architecture:** Expert in `$config({ app, run })` single-file pattern, `sst.config.ts` as the source of truth for entire applications
- **Built-in Components:** Deep knowledge of `sst.aws.*` and `sst.cloudflare.*` namespaces — Nextjs, Remix, Astro, SvelteKit, SolidStart, Function, Cluster, Service, Bucket, Dynamo, Postgres, Api, Router, Queue, Topic, Bus, Cron, Email, Auth, Realtime, Vpc, Secret
- **Resource Linking:** Mastery of `link` prop for connecting resources and `Resource` SDK (`import { Resource } from "sst"`) for type-safe runtime access
- **Transform System:** Per-component `transform` prop and global `$transform()` for customizing underlying Pulumi resources without ejecting
- **Provider Ecosystem:** Integration of 150+ Pulumi/Terraform providers (Stripe, Vercel, Cloudflare, etc.) alongside SST built-in components
- **Stage Management:** Environment isolation via `--stage` flag, stage-aware configuration (removal policies, provider settings, conditional resources)
- **Live Development:** `sst dev` multiplexer — live Lambda execution, infrastructure watching, VPC tunneling, frontend/container dev mode orchestration
- **Pulumi Internals:** Understanding that SST v3 uses Pulumi (not CDK) under the hood, `Input<T>` types, `ComponentResourceOptions`, state management
