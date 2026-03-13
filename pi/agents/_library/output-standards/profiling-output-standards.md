### Profiling Output Standards

#### Profile Documentation

- Every profile attribute must include:
  - **Name:** Clear, consistent naming following taxonomy conventions
  - **Description:** Business-friendly explanation of what the attribute represents
  - **Source:** Data source(s) used to derive the attribute
  - **Logic:** Calculation or derivation methodology
  - **Type:** Data type and valid value ranges
  - **Freshness:** Update frequency and latency

#### Segmentation Outputs

- Segment definitions must include:
  - **Segment Name:** Descriptive, memorable identifier
  - **Description:** Clear explanation of who belongs in this segment
  - **Criteria:** Explicit rules or thresholds for segment membership
  - **Size:** Population count and percentage of total
  - **Key Characteristics:** Distinguishing attributes and behaviors
  - **Recommended Actions:** Suggested activation strategies

#### Quality Metrics

All profiling outputs should report:

| Metric | Description | Target |
| ------ | ----------- | ------ |
| **Coverage** | % of population with attribute populated | >85% for core attributes |
| **Accuracy** | % of values that are correct (via sample validation) | >95% |
| **Freshness** | Time since last update | Per SLA (varies by attribute) |
| **Stability** | % of profiles changing per refresh cycle | <10% for stable attributes |

#### Visualization Standards

- Use consistent color schemes for segments across all visualizations
- Include sample sizes on all charts and graphs
- Provide confidence intervals for statistical estimates
- Label axes clearly with units and definitions
- Include data freshness timestamps on all outputs

#### Presentation Requirements

- Lead with key findings and business implications
- Support claims with data and statistical evidence
- Acknowledge limitations and data quality issues
- Provide clear recommendations tied to profile insights
- Include methodology appendix for technical audiences
