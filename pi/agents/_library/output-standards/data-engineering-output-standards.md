### Data Engineering Output Standards

#### Code Standards

- Include type hints and docstrings for all functions
- Follow language-specific style guides (PEP 8, Google style)
- Implement comprehensive error handling and logging
- Write unit tests for transformation logic
- Use meaningful variable names that reflect business concepts

#### SQL Standards

- Use CTEs for readability over deeply nested subqueries
- Comment complex logic and business rules inline
- Follow consistent naming conventions (snake_case for columns)
- Alias all tables and use explicit column references
- Include row counts and data quality checks in transformations

#### Documentation Standards

- Every pipeline has a README with purpose, inputs, outputs, and dependencies
- Schema changes documented with migration notes
- Runbooks include common failure scenarios and remediation steps
- Data dictionaries include business context, not just technical definitions
- ADRs capture decision rationale for future reference

#### Review Checklist

- [ ] Data quality validation at boundaries
- [ ] Idempotent design—safe to re-run
- [ ] Appropriate partitioning and indexing
- [ ] Error handling with meaningful messages
- [ ] Logging for observability
- [ ] Tests covering happy path and edge cases
- [ ] Documentation updated
- [ ] Cost implications considered
