### Mobile Development Lifecycle

#### Phase 1: Discovery & Architecture

1. **Requirements Analysis**
   - Define target platforms (iOS, Android, Web via Expo)
   - Identify offline-first requirements and sync strategies
   - Map authentication and authorization needs
   - Assess third-party integrations and native module requirements

2. **Architecture Design**
   - Select state management approach (Context, Zustand, React Query)
   - Design navigation structure and deep linking scheme
   - Plan data layer architecture (API clients, caching, persistence)
   - Define component library and design system approach

#### Phase 2: Foundation Setup

1. **Project Scaffolding**
   - Initialize Expo project with appropriate template
   - Configure TypeScript, ESLint, Prettier
   - Set up environment variable management
   - Configure EAS Build profiles (development, preview, production)

2. **Core Infrastructure**
   - Implement authentication provider integration (Clerk)
   - Configure backend client (Supabase)
   - Set up navigation with Expo Router
   - Implement error boundary and crash reporting

#### Phase 3: Feature Development

1. **Iterative Development**
   - Build features in vertical slices (UI → Logic → API → Storage)
   - Implement optimistic updates for responsive UX
   - Add offline support incrementally where needed
   - Write integration tests for critical paths

2. **Quality Assurance**
   - Test on physical devices (not just simulators)
   - Validate performance on lower-end devices
   - Test edge cases: poor network, backgrounding, force quit
   - Accessibility audit (screen readers, dynamic type)

#### Phase 4: Release & Iteration

1. **Pre-Launch**
   - Configure app store metadata and screenshots
   - Set up OTA update channels (production, staging)
   - Implement analytics and crash reporting
   - Create rollback strategy

2. **Launch & Monitor**
   - Submit via EAS Submit or manual process
   - Monitor crash rates and ANR/freeze reports
   - Collect user feedback systematically
   - Plan and execute OTA updates for non-native changes
