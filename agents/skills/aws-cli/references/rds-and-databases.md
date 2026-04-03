# RDS & Database Services Reference

## RDS Instances

```bash
# List instances
aws rds describe-db-instances \
  --query 'DBInstances[].{ID:DBInstanceIdentifier,Engine:Engine,Status:DBInstanceStatus,Class:DBInstanceClass,Endpoint:Endpoint.Address}' \
  --output table

# Describe specific instance
aws rds describe-db-instances --db-instance-identifier <name>

# Create instance
aws rds create-db-instance \
  --db-instance-identifier my-db \
  --db-instance-class db.t3.micro \
  --engine postgres --engine-version 15 \
  --master-username admin \
  --master-user-password <password> \
  --allocated-storage 20

# Modify instance
aws rds modify-db-instance --db-instance-identifier <name> \
  --db-instance-class db.t3.medium --apply-immediately

# Start / stop
aws rds start-db-instance --db-instance-identifier <name>
aws rds stop-db-instance --db-instance-identifier <name>

# Delete (skip final snapshot)
aws rds delete-db-instance --db-instance-identifier <name> \
  --skip-final-snapshot
# Delete (with final snapshot)
aws rds delete-db-instance --db-instance-identifier <name> \
  --final-db-snapshot-identifier <name>-final-$(date +%Y%m%d)
```

## Snapshots

```bash
# List snapshots
aws rds describe-db-snapshots --db-instance-identifier <name> \
  --query 'DBSnapshots[].{ID:DBSnapshotIdentifier,Status:Status,Created:SnapshotCreateTime,Size:AllocatedStorage}' \
  --output table

# Create manual snapshot
aws rds create-db-snapshot \
  --db-instance-identifier <name> \
  --db-snapshot-identifier <name>-$(date +%Y%m%d)

# Restore from snapshot
aws rds restore-db-instance-from-db-snapshot \
  --db-instance-identifier <name>-restored \
  --db-snapshot-identifier <snapshot-id>
```

## DynamoDB

```bash
# List tables
aws dynamodb list-tables

# Describe table
aws dynamodb describe-table --table-name <name> \
  --query 'Table.{Name:TableName,Status:TableStatus,Items:ItemCount,Size:TableSizeBytes}'

# Get item
aws dynamodb get-item --table-name <name> \
  --key '{"id": {"S": "my-key"}}'

# Put item
aws dynamodb put-item --table-name <name> \
  --item '{"id": {"S": "my-key"}, "data": {"S": "value"}}'

# Query
aws dynamodb query --table-name <name> \
  --key-condition-expression "pk = :pk" \
  --expression-attribute-values '{":pk": {"S": "value"}}'

# Scan (use sparingly)
aws dynamodb scan --table-name <name> --max-items 10
```
