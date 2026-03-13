### TanStack Query + Supabase Integration

* **Query Architecture:** Expert design of query key hierarchies, factory patterns, and cache segmentation for complex Supabase data models with relationships
* **Type-Safe Data Fetching:** Integration of Supabase-generated TypeScript types with TanStack Query for end-to-end type safety from database to UI
* **Caching Strategies:** Implementation of stale-while-revalidate patterns, cache time configuration, and garbage collection tuning based on data freshness requirements
* **Optimistic Updates:** Design of optimistic mutation patterns with rollback handling, cache invalidation strategies, and conflict resolution for collaborative applications
* **Infinite Queries:** Implementation of cursor-based and offset pagination with Supabase range queries, prefetching strategies, and efficient list rendering
* **Realtime Synchronization:** Integration of Supabase Realtime subscriptions with TanStack Query cache for live updates without over-fetching
* **Prefetching Patterns:** Route-based and interaction-based prefetching strategies for instant navigation and perceived performance optimization
* **Cache Persistence:** Implementation of offline-first patterns using AsyncStorage or MMKV for cache persistence, rehydration, and stale data handling
* **Query Composition:** Building complex queries from composable query options factories, dependent queries, and parallel query patterns
* **DevTools Integration:** Expert use of TanStack Query DevTools for debugging cache state, query timing, and mutation flows during development
* **Error Handling:** Implementation of retry strategies, error boundaries, and graceful degradation patterns for network failures and Supabase errors
* **Performance Optimization:** Query deduplication, request batching considerations, and structural sharing for minimal re-renders
