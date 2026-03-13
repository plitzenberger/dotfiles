### SST v3 Architecture Patterns

#### Config Structure Pattern
```typescript
/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "my-app",
      removal: input?.stage === "production" ? "retain" : "remove",
      providers: { aws: { region: "us-east-1" } },
    };
  },
  async run() {
    // All infrastructure here or split via imports
    await import("./infra/database");
    await import("./infra/api");
    await import("./infra/web");
  },
});
```

#### Resource Linking Pattern
```typescript
// Define and link
const bucket = new sst.aws.Bucket("MyBucket");
const secret = new sst.Secret("StripeKey");
new sst.aws.Function("MyFn", {
  handler: "src/handler.handler",
  link: [bucket, secret],
});

// Access at runtime
import { Resource } from "sst";
Resource.MyBucket.name;    // type-safe S3 bucket name
Resource.StripeKey.value;  // type-safe secret value
```

#### Transform Pattern
```typescript
// Per-component: customize underlying Pulumi resources
new sst.aws.Function("MyFn", {
  handler: "src/handler.handler",
  transform: {
    role: (args) => { args.name = "custom-role"; },
    function: { memorySize: 1024 },
  },
});

// Global: apply defaults across all instances
$transform(sst.aws.Function, (args) => {
  args.runtime ??= "nodejs22.x";
  args.memory ??= "512 MB";
});
```

#### Multi-Provider Pattern
```typescript
providers: {
  aws: { region: "us-east-1" },
  cloudflare: true,
  stripe: true,
  vercel: true,
}
// Then use: new stripe.Product("Pro", { name: "Pro Plan" });
```

#### Monorepo Split Infra Pattern
```
my-app/
├── sst.config.ts       # Entry point with imports
├── infra/
│   ├── database.ts     # export const db = new sst.aws.Dynamo(...)
│   ├── api.ts          # import { db } from "./database"
│   └── web.ts
├── packages/
│   ├── functions/      # Lambda handlers
│   ├── frontend/       # Web app
│   └── core/           # Shared business logic & types
```

#### Container Service Pattern
```typescript
const vpc = new sst.aws.Vpc("MyVpc");
const cluster = new sst.aws.Cluster("MyCluster", { vpc });
new sst.aws.Service("MyService", {
  cluster,
  link: [bucket, db],
  loadBalancer: { ports: [{ listen: "80/http" }] },
});
```

#### Event-Driven Pattern
```typescript
const bus = new sst.aws.Bus("MyBus");
bus.subscribe("src/events/order.handler", {
  pattern: { source: ["myapp.orders"] },
});
const queue = new sst.aws.Queue("MyQueue");
queue.subscribe("src/queue/process.handler");
```
