### Fullstack Web Development Lifecycle

#### Phase 1: Discovery & Architecture

1. **Requirements Analysis**
   - Define target deployment platform (Cloudflare, Vercel, Node.js)
   - Identify SSR vs static generation requirements
   - Map authentication and authorization needs
   - Assess third-party integrations and API requirements
   - Determine internationalization scope and supported locales

2. **Architecture Design**
   - Select routing strategy (file-based, config-based)
   - Design layout hierarchy and component structure
   - Plan data layer architecture (loaders, actions, external APIs)
   - Define design system approach and styling patterns
   - Establish state management strategy (server state vs client state)

#### Phase 2: Foundation Setup

1. **Project Scaffolding**
   - Initialize React Router v7 project with appropriate template
   - Configure TypeScript with strict mode
   - Set up Tailwind CSS v4 with design tokens
   - Configure Vite plugins and build optimization
   - Set up environment variable management

2. **Core Infrastructure**
   - Implement authentication provider integration
   - Configure deployment platform (Wrangler for Cloudflare)
   - Set up routing structure with type-safe routes
   - Implement error boundary and fallback UI
   - Configure theme provider and dark mode support

#### Phase 3: Feature Development

1. **Iterative Development**
   - Build features in vertical slices (Route → Loader → UI → Actions)
   - Implement progressive enhancement patterns
   - Add internationalization incrementally
   - Write integration tests for critical paths
   - Validate accessibility at each milestone

2. **Quality Assurance**
   - Test SSR hydration consistency
   - Validate SEO metadata and Open Graph tags
   - Performance audit (Core Web Vitals)
   - Cross-browser and device testing
   - Accessibility audit (WCAG compliance)

#### Phase 4: Release & Iteration

1. **Pre-Launch**
   - Configure deployment pipelines (CI/CD)
   - Set up preview deployments for branches
   - Implement analytics and error tracking
   - Create rollback strategy
   - Performance baseline and monitoring setup

2. **Launch & Monitor**
   - Deploy via platform CLI or Git integration
   - Monitor error rates and performance metrics
   - Collect user feedback systematically
   - Plan and execute incremental improvements
   - Document operational runbooks
