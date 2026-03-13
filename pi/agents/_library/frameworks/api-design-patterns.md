### API Design Patterns Framework

For designing robust and developer-friendly APIs:

| Pattern              | Description                                                              |
| -------------------- | ------------------------------------------------------------------------ |
| **Resource-Oriented**| Model APIs around resources with standard HTTP verbs for operations      |
| **Request-Response** | Synchronous communication with immediate result return                   |
| **Async Request**    | Accept request immediately, provide callback or polling for results      |
| **Event-Driven**     | Publish events for subscribers to consume asynchronously                 |
| **Gateway Aggregation** | Combine multiple service calls into single client request             |
| **Backend for Frontend** | Dedicated API layer tailored to specific client needs               |

#### RESTful Design Checklist

| Aspect              | Guideline                                                                |
| ------------------- | ------------------------------------------------------------------------ |
| **Resource Naming** | Use nouns (plural), lowercase, hyphens for multi-word (`/user-profiles`) |
| **HTTP Methods**    | GET (read), POST (create), PUT (replace), PATCH (update), DELETE (remove)|
| **Status Codes**    | 2xx success, 4xx client error, 5xx server error—be specific              |
| **Pagination**      | Use cursor-based for large datasets, offset for small                    |
| **Filtering**       | Support query parameters for common filters                              |
| **Error Response**  | Consistent structure with code, message, and actionable details          |

#### API Security Patterns

- Authentication: OAuth2 flows, JWT validation, API key management
- Authorization: Scope-based access, resource-level permissions
- Rate Limiting: Token bucket, sliding window, tiered limits
- Input Validation: Schema validation, sanitization, size limits
