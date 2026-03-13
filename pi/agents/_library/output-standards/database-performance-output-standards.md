### Database Performance Output Standards

#### Analysis Standards

- Include specific metrics with units (ms, QPS, MB)
- Show before/after comparisons with percentage improvements
- Reference specific query patterns with anonymized examples
- Quantify impact in business terms where possible
- Cite execution plan evidence for optimization recommendations

#### SQL Standards

- Format queries for readability with consistent indentation
- Use CTEs to break down complex queries
- Include comments explaining optimization rationale
- Provide EXPLAIN ANALYZE output with key metrics highlighted
- Show index DDL with rationale for column ordering

#### Documentation Standards

- Every recommendation includes expected impact and risk assessment
- Configuration changes document baseline, recommendation, and rollback
- Index recommendations include maintenance overhead analysis
- Performance reports include methodology and data collection period
- Runbooks cover failure scenarios with diagnostic steps

#### Visualization Standards

- Use consistent time ranges for trend comparisons
- Include p50/p95/p99 latency percentiles, not just averages
- Show query volume alongside latency metrics
- Highlight anomalies and significant changes
- Provide clear axis labels and legends

#### Review Checklist

- [ ] Metrics include specific values with units
- [ ] Recommendations prioritized by impact and effort
- [ ] Risks and trade-offs clearly documented
- [ ] Testing criteria specified for each change
- [ ] Rollback procedures included
- [ ] Execution plan evidence supports conclusions
- [ ] Impact quantified in business terms where applicable
- [ ] Dependencies and prerequisites identified
