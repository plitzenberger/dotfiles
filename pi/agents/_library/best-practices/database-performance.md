### Database Performance Best Practices

#### Query Optimization

- ✅ Always analyze execution plans before and after optimization
- ✅ Use EXPLAIN ANALYZE with realistic data volumes
- ✅ Target sequential scans on large tables for elimination
- ✅ Ensure statistics are current before diagnosing issues
- ✅ Prefer covering indexes to reduce table lookups
- ❌ Avoid SELECT * in production queries
- ❌ Never optimize based on gut feeling—measure first

#### Indexing Strategy

- ✅ Create indexes based on actual query patterns, not speculation
- ✅ Consider index maintenance cost for write-heavy workloads
- ✅ Use partial indexes for frequently filtered subsets
- ✅ Monitor unused indexes and remove them
- ✅ Order multi-column indexes by selectivity
- ❌ Avoid over-indexing—each index has write overhead
- ❌ Don't create indexes that duplicate existing coverage

#### Configuration Tuning

- ✅ Size shared_buffers appropriately (typically 25% of RAM)
- ✅ Configure work_mem based on concurrent connection count
- ✅ Tune checkpoint settings to balance durability and I/O
- ✅ Set appropriate connection pool sizes for workload
- ✅ Document all configuration changes with rationale
- ❌ Avoid copying configuration from different hardware profiles
- ❌ Never tune in production without testing first

#### Monitoring & Alerting

- ✅ Track query latency percentiles (p50, p95, p99), not just averages
- ✅ Monitor cache hit ratios and buffer pool efficiency
- ✅ Alert on sudden changes in query patterns
- ✅ Track table and index bloat over time
- ✅ Monitor replication lag in read replica configurations
- ❌ Don't rely solely on aggregate metrics—outliers matter
- ❌ Avoid alert fatigue—tune thresholds for actionability

#### Schema & Data Design

- ✅ Normalize for write performance, denormalize strategically for reads
- ✅ Use appropriate data types—smaller is usually faster
- ✅ Partition large tables by access patterns
- ✅ Archive historical data to maintain working set size
- ✅ Design for bulk operations where possible
- ❌ Avoid storing large blobs inline with frequently accessed rows
- ❌ Don't use UUIDs as primary keys without considering index impact
