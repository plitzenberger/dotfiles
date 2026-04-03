# ECS & Container Services Reference

## ECS Clusters

```bash
# List clusters
aws ecs list-clusters

# Describe cluster
aws ecs describe-clusters --clusters <name> \
  --include STATISTICS ATTACHMENTS

# List services in cluster
aws ecs list-services --cluster <name>

# Describe service
aws ecs describe-services --cluster <name> --services <service-name> \
  --query 'services[0].{Status:status,Desired:desiredCount,Running:runningCount,TaskDef:taskDefinition}'
```

## Tasks

```bash
# List running tasks
aws ecs list-tasks --cluster <name> --service-name <service>

# Describe task
aws ecs describe-tasks --cluster <name> --tasks <task-arn>

# Run one-off task
aws ecs run-task --cluster <name> --task-definition <name> \
  --count 1 --launch-type FARGATE \
  --network-configuration 'awsvpcConfiguration={subnets=[subnet-xxx],securityGroups=[sg-xxx],assignPublicIp=ENABLED}'

# Stop task
aws ecs stop-task --cluster <name> --task <task-arn> --reason "Manual stop"

# Execute command in running container
aws ecs execute-command --cluster <name> --task <task-arn> \
  --container <container-name> --interactive --command "/bin/sh"
```

## Task Definitions

```bash
# List task definitions
aws ecs list-task-definitions --family-prefix <family> --sort DESC --max-items 5

# Describe latest
aws ecs describe-task-definition --task-definition <family>

# Register new revision
aws ecs register-task-definition --cli-input-json file://task-def.json

# Deregister
aws ecs deregister-task-definition --task-definition <family>:<revision>
```

## Service Updates

```bash
# Update service (new task definition)
aws ecs update-service --cluster <name> --service <service> \
  --task-definition <family>:<revision>

# Scale service
aws ecs update-service --cluster <name> --service <service> \
  --desired-count 3

# Force new deployment (same task def)
aws ecs update-service --cluster <name> --service <service> \
  --force-new-deployment

# Wait for service stability
aws ecs wait services-stable --cluster <name> --services <service>
```

## ECR (Container Registry)

```bash
# Login to ECR
aws ecr get-login-password --region <region> | \
  docker login --username AWS --password-stdin <account-id>.dkr.ecr.<region>.amazonaws.com

# List repositories
aws ecr describe-repositories \
  --query 'repositories[].{Name:repositoryName,URI:repositoryUri}' --output table

# List images in repo
aws ecr list-images --repository-name <name> \
  --query 'imageIds[].imageTag' --output table

# Create repository
aws ecr create-repository --repository-name <name> \
  --image-scanning-configuration scanOnPush=true

# Delete untagged images (cleanup)
aws ecr batch-delete-image --repository-name <name> \
  --image-ids "$(aws ecr list-images --repository-name <name> \
    --filter tagStatus=UNTAGGED --query 'imageIds' --output json)"
```

## Service Logs

```bash
# If using awslogs driver, view container logs
aws logs tail /ecs/<service-name> --follow --since 30m

# Filter for errors
aws logs filter-log-events --log-group-name /ecs/<service-name> \
  --filter-pattern "ERROR" --start-time $(date -v-1H +%s000)
```
