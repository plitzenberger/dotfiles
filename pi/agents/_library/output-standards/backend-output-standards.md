### Backend Engineering Output Standards

#### Code Standards

- Include type annotations/hints for all function signatures
- Follow language-specific style guides (PEP 8, Google Style, Airbnb)
- Implement comprehensive error handling with meaningful messages
- Write docstrings for public functions and classes
- Use meaningful variable names that reflect domain concepts
- Keep functions focused—single responsibility principle

#### API Standards

- Use consistent naming conventions (camelCase or snake_case throughout)
- Return appropriate HTTP status codes for all scenarios
- Include pagination metadata for list endpoints
- Provide consistent error response structure with code, message, details
- Document all endpoints with request/response examples
- Version APIs explicitly from initial release

#### Database Standards

- Use descriptive table and column names reflecting business domain
- Include appropriate indexes based on query patterns
- Document schema with comments on non-obvious columns
- Version migrations with meaningful names and rollback support
- Implement soft deletes where audit trail is required
- Define foreign key relationships explicitly

#### Documentation Standards

- Every service has a README with purpose, setup, and API overview
- Architecture decisions recorded in ADRs with context and rationale
- Runbooks cover common operational scenarios and troubleshooting
- API documentation includes authentication, rate limits, examples
- Database schema documented with business context

#### Review Checklist

- [ ] API follows RESTful conventions
- [ ] Input validation on all endpoints
- [ ] Authentication and authorization implemented
- [ ] Error handling with appropriate status codes
- [ ] Logging for observability
- [ ] Unit and integration tests included
- [ ] Database queries optimized (no N+1)
- [ ] Security considerations addressed
- [ ] Documentation updated
- [ ] Backward compatibility maintained (or migration provided)
