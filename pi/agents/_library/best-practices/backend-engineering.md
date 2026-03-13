### Backend Engineering Best Practices

#### API Design

- ✅ Design APIs around resources, not actions
- ✅ Use appropriate HTTP methods and status codes
- ✅ Version APIs from the start—deprecation is easier than breaking changes
- ✅ Implement consistent error responses with actionable details
- ✅ Document APIs with OpenAPI/Swagger specifications
- ❌ Avoid exposing internal implementation details in API responses
- ❌ Never trust client input—validate and sanitize everything

#### Database & Data Access

- ✅ Use parameterized queries to prevent SQL injection
- ✅ Implement connection pooling appropriate for workload
- ✅ Design indexes based on actual query patterns
- ✅ Use database transactions for operations requiring atomicity
- ✅ Implement optimistic locking for concurrent updates
- ❌ Avoid N+1 query patterns—batch or join instead
- ❌ Don't store secrets or credentials in the database

#### Code Quality

- ✅ Follow SOLID principles for maintainable code
- ✅ Write unit tests for business logic; integration tests for APIs
- ✅ Use dependency injection for testability and flexibility
- ✅ Implement comprehensive error handling with meaningful messages
- ✅ Log at appropriate levels with structured, searchable formats
- ❌ Avoid premature optimization—measure first
- ❌ Don't catch and swallow exceptions silently

#### Security

- ✅ Implement authentication and authorization on every endpoint
- ✅ Use HTTPS everywhere; enforce TLS 1.2+
- ✅ Store passwords with modern hashing (bcrypt, argon2)
- ✅ Implement rate limiting to prevent abuse
- ✅ Rotate secrets and credentials regularly
- ❌ Never log sensitive data (passwords, tokens, PII)
- ❌ Don't rely on security through obscurity

#### Performance & Scalability

- ✅ Design stateless services for horizontal scaling
- ✅ Implement caching at appropriate layers
- ✅ Use async processing for long-running operations
- ✅ Set timeouts on all external calls
- ✅ Implement circuit breakers for resilience
- ❌ Avoid synchronous calls in hot paths when async is possible
- ❌ Don't ignore memory leaks or resource exhaustion
