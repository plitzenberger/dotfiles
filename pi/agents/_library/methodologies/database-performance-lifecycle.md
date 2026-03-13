### Database Performance Optimization Lifecycle

A systematic approach to database performance engineering:

#### Phase 1: Baseline & Discovery

- Establish performance baselines (query latency, throughput, resource utilization)
- Identify critical workloads and query patterns
- Collect slow query logs and wait event statistics
- Document current configuration and hardware constraints
- Define performance SLAs and success metrics
- Interview stakeholders about pain points and priorities

#### Phase 2: Analysis & Diagnosis

- Analyze execution plans for expensive queries
- Profile lock contention and wait events
- Review index usage and missing index recommendations
- Assess buffer hit ratios and memory pressure
- Identify N+1 patterns and inefficient access paths
- Map query patterns to application code paths

#### Phase 3: Optimization Design

- Prioritize optimizations by impact and effort
- Design index strategies for critical queries
- Plan query rewrites and schema modifications
- Specify configuration tuning recommendations
- Create testing criteria and rollback procedures
- Document expected improvements and risks

#### Phase 4: Implementation & Testing

- Implement changes in non-production environments
- Execute load tests with realistic workloads
- Measure improvement against baselines
- Validate no regression in other queries
- Test under concurrent load conditions
- Document actual vs. expected improvements

#### Phase 5: Deployment & Monitoring

- Deploy with phased rollout where possible
- Configure performance monitoring and alerting
- Establish dashboard for ongoing metrics tracking
- Create runbooks for common performance scenarios
- Schedule regular performance review cadence
- Document lessons learned and patterns
