### Pulumi Architecture Patterns

#### Basic Program Structure (TypeScript)
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

const config = new pulumi.Config();
const env = pulumi.getStack();

const bucket = new aws.s3.Bucket("my-bucket", {
  tags: { Environment: env },
});

export const bucketName = bucket.id;
export const bucketArn = bucket.arn;
```

#### Component Resource Pattern
```typescript
import * as pulumi from "@pulumi/pulumi";
import * as aws from "@pulumi/aws";

interface StaticSiteArgs {
  domain: string;
  content: string;
}

class StaticSite extends pulumi.ComponentResource {
  public readonly url: pulumi.Output<string>;

  constructor(name: string, args: StaticSiteArgs, opts?: pulumi.ComponentResourceOptions) {
    super("custom:StaticSite", name, {}, opts);

    const bucket = new aws.s3.BucketV2(name, {
      bucket: args.domain,
    }, { parent: this });

    const cdn = new aws.cloudfront.Distribution(`${name}-cdn`, {
      origins: [{ domainName: bucket.bucketRegionalDomainName, originId: "s3" }],
      enabled: true,
      defaultCacheBehavior: {
        viewerProtocolPolicy: "redirect-to-https",
        allowedMethods: ["GET", "HEAD"],
        cachedMethods: ["GET", "HEAD"],
        targetOriginId: "s3",
        forwardedValues: { queryString: false, cookies: { forward: "none" } },
      },
      restrictions: { geoRestriction: { restrictionType: "none" } },
      viewerCertificate: { cloudfrontDefaultCertificate: true },
    }, { parent: this });

    this.url = pulumi.interpolate`https://${cdn.domainName}`;
    this.registerOutputs({ url: this.url });
  }
}
```

#### Multi-Stack with Stack References
```typescript
// Stack: networking
export const vpcId = vpc.id;
export const subnetIds = privateSubnets.map(s => s.id);

// Stack: application
const network = new pulumi.StackReference("org/networking/prod");
const vpcId = network.getOutput("vpcId");
const subnetIds = network.getOutput("subnetIds");
```

#### Multi-Region / Multi-Account Pattern
```typescript
const usEast1 = new aws.Provider("us-east-1", { region: "us-east-1" });
const euWest1 = new aws.Provider("eu-west-1", { region: "eu-west-1" });

const usBucket = new aws.s3.Bucket("us-data", {}, { provider: usEast1 });
const euBucket = new aws.s3.Bucket("eu-data", {}, { provider: euWest1 });
```

#### Kubernetes Deployment Pattern
```typescript
import * as k8s from "@pulumi/kubernetes";

const appLabels = { app: "nginx" };
const deployment = new k8s.apps.v1.Deployment("nginx", {
  spec: {
    selector: { matchLabels: appLabels },
    replicas: 3,
    template: {
      metadata: { labels: appLabels },
      spec: { containers: [{ name: "nginx", image: "nginx:1.25" }] },
    },
  },
});

const service = new k8s.core.v1.Service("nginx-svc", {
  spec: {
    selector: appLabels,
    ports: [{ port: 80, targetPort: 80 }],
    type: "LoadBalancer",
  },
});

export const url = service.status.loadBalancer.ingress[0].hostname;
```

#### Dynamic Provider Pattern
```typescript
const myResource = new pulumi.dynamic.Resource("my-res", {
  create: async (inputs) => {
    // Custom create logic (API calls, etc.)
    return { id: "unique-id", outs: { result: "created" } };
  },
  update: async (id, olds, news) => { /* ... */ },
  delete: async (id, props) => { /* ... */ },
  diff: async (id, olds, news) => ({ changes: true }),
});
```

#### Transformation Pattern
```typescript
// Apply tags to all resources in a stack
pulumi.runtime.registerStackTransformation(({ type, props, opts }) => {
  if (props["tags"]) {
    props["tags"] = { ...props["tags"], ManagedBy: "pulumi", Stack: pulumi.getStack() };
  }
  return { props, opts };
});
```

#### Monorepo Project Structure
```
infrastructure/
├── stacks/
│   ├── networking/        # VPC, subnets, DNS
│   │   ├── Pulumi.yaml
│   │   ├── Pulumi.dev.yaml
│   │   ├── Pulumi.prod.yaml
│   │   └── index.ts
│   ├── data/              # Databases, caches, queues
│   │   └── ...
│   ├── compute/           # ECS, Lambda, EKS
│   │   └── ...
│   └── app/               # Application-specific resources
│       └── ...
├── components/            # Reusable ComponentResources
│   ├── static-site.ts
│   ├── api-gateway.ts
│   └── vpc.ts
├── policies/              # CrossGuard policy packs
│   └── ...
└── package.json
```
