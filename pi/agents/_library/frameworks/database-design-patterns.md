### Database Design Patterns Framework

For designing efficient and maintainable database schemas:

| Pattern                  | Description                                                          |
| ------------------------ | -------------------------------------------------------------------- |
| **Normalization**        | Eliminate redundancy through systematic decomposition (1NF-3NF+)     |
| **Denormalization**      | Strategic redundancy for read performance optimization               |
| **Single Table Design**  | DynamoDB pattern—store multiple entity types in one table            |
| **Entity-Attribute-Value**| Flexible schema for variable attributes                             |
| **Polymorphic Association** | Link to multiple table types through type discriminator           |
| **Soft Delete**          | Mark records deleted without physical removal                        |

#### Query Optimization Checklist

| Aspect              | Guideline                                                                |
| ------------------- | ------------------------------------------------------------------------ |
| **Indexing**        | Index columns used in WHERE, JOIN, ORDER BY; avoid over-indexing        |
| **Query Analysis**  | Use EXPLAIN to understand execution plans before optimization           |
| **N+1 Prevention**  | Use JOINs or batch queries instead of loops                             |
| **Pagination**      | Use keyset pagination for large datasets; avoid OFFSET at scale         |
| **Connection Pooling** | Right-size pools for workload; monitor connection utilization        |
| **Read/Write Split**| Route read queries to replicas; writes to primary                       |

#### Data Integrity Patterns

- Foreign key constraints for referential integrity
- Check constraints for domain validation
- Unique constraints for business rules
- Transaction isolation levels appropriate for use case
- Optimistic locking for concurrent updates
- Audit trails for compliance requirements
