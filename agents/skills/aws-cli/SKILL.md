---
name: aws-cli
description: |
  Manage AWS resources using the aws CLI v2. Use for EC2 instances, S3 buckets,
  IAM, Lambda, ECS, CloudFormation, RDS, CloudWatch, SSM, STS, and any AWS service.
  Covers creation, listing, describing, updating, and deleting AWS resources.
  Use when the user asks to: launch/stop/terminate instances, upload/download from S3,
  check AWS identity, manage IAM roles/policies, deploy stacks, view logs, run SSM commands,
  check costs, manage security groups, or interact with any AWS service.
  Also trigger when user mentions: EC2, S3, Lambda, ECS, RDS, CloudFormation, IAM,
  "my AWS account", "the instance", ARNs, regions, or AWS resource IDs (i-xxx, sg-xxx, etc.).
  Do NOT use for Terraform/CDK/Pulumi IaC authoring — only for direct AWS CLI operations.
  Do NOT use for AWS console UI tasks or SDK code in application source.
---

# AWS CLI Skill

Manage AWS resources via `aws` CLI v2. Always use `--output json` when parsing results programmatically. Use `--query` (JMESPath) to filter server-side.

## Authentication

Verify identity before any operation:

```bash
aws sts get-caller-identity
```

If using SSO and session expired:

```bash
aws sso login --profile <profile>
# or if default profile is SSO-based:
aws sso login
```

Check configured profiles:

```bash
aws configure list-profiles
aws configure list          # show active profile details
```

> **Rule:** Always confirm the correct account/role before destructive operations (terminate, delete, remove). Print `aws sts get-caller-identity` first.

## Workflow

1. **Identify** — Confirm account, region, and role with `sts get-caller-identity`
2. **Discover** — List/describe existing resources before modifying
3. **Act** — Create, update, or delete resources
4. **Verify** — Confirm the action succeeded with a describe/list call
5. **Tag** — Apply tags to new resources for cost tracking and organization

## Quick Reference (Common Services)

### EC2

```bash
# List instances (with Name tag)
aws ec2 describe-instances \
  --query 'Reservations[].Instances[].{ID:InstanceId,Name:Tags[?Key==`Name`]|[0].Value,State:State.Name,Type:InstanceType,IP:PublicIpAddress}' \
  --output table

# Start / stop / terminate
aws ec2 start-instances --instance-ids i-xxx
aws ec2 stop-instances --instance-ids i-xxx
aws ec2 terminate-instances --instance-ids i-xxx

# Describe a specific instance
aws ec2 describe-instances --instance-ids i-xxx

# Security groups
aws ec2 describe-security-groups --group-ids sg-xxx
aws ec2 authorize-security-group-ingress --group-id sg-xxx \
  --protocol tcp --port 22 --cidr 0.0.0.0/0

# Key pairs
aws ec2 describe-key-pairs --output table
```

### S3

```bash
# List buckets
aws s3 ls

# List objects (with human-readable sizes)
aws s3 ls s3://bucket/prefix/ --human-readable --summarize

# Upload / download
aws s3 cp local-file s3://bucket/key
aws s3 cp s3://bucket/key local-file

# Sync directories
aws s3 sync ./local-dir s3://bucket/prefix/
aws s3 sync s3://bucket/prefix/ ./local-dir

# Remove
aws s3 rm s3://bucket/key
aws s3 rm s3://bucket/prefix/ --recursive

# Presigned URL (1 hour default)
aws s3 presign s3://bucket/key --expires-in 3600
```

### IAM

```bash
# Current user / role
aws sts get-caller-identity

# List roles / users / policies
aws iam list-roles --query 'Roles[].{Name:RoleName,Arn:Arn}' --output table
aws iam list-users --query 'Users[].{Name:UserName,Arn:Arn}' --output table
aws iam list-attached-role-policies --role-name <role>

# Get policy document
aws iam get-role-policy --role-name <role> --policy-name <policy>
```

### CloudFormation

```bash
# List stacks
aws cloudformation list-stacks --stack-status-filter CREATE_COMPLETE UPDATE_COMPLETE

# Describe stack
aws cloudformation describe-stacks --stack-name <name>

# Stack events (for debugging)
aws cloudformation describe-stack-events --stack-name <name> \
  --query 'StackEvents[?ResourceStatus==`CREATE_FAILED`]'

# Deploy stack
aws cloudformation deploy --template-file template.yaml --stack-name <name> \
  --capabilities CAPABILITY_IAM --parameter-overrides Key=Value

# Delete stack
aws cloudformation delete-stack --stack-name <name>
```

### Lambda

```bash
# List functions
aws lambda list-functions --query 'Functions[].{Name:FunctionName,Runtime:Runtime,Memory:MemorySize}' --output table

# Invoke
aws lambda invoke --function-name <name> --payload '{"key":"value"}' /dev/stdout

# View logs (last 5 min)
aws logs filter-log-events --log-group-name /aws/lambda/<name> \
  --start-time $(date -v-5M +%s000) --query 'events[].message' --output text
```

### SSM (Systems Manager)

```bash
# Run command on instance
aws ssm send-command --instance-ids i-xxx \
  --document-name "AWS-RunShellScript" \
  --parameters commands=["uptime"]

# Start interactive session
aws ssm start-session --target i-xxx

# Get parameter
aws ssm get-parameter --name /path/to/param --with-decryption
```

## Scripts

Reusable scripts in `scripts/` relative to this skill file.

| Script | Purpose | Usage |
|---|---|---|
| `ec2-capacity-watcher.sh` | Poll until a stopped EC2 instance can start (handles InsufficientInstanceCapacity) | `<scripts>/ec2-capacity-watcher.sh -i <instance-id> [options]` |

> **Resolve `<scripts>` to the absolute path** of the `scripts/` directory next to this SKILL.md before running.

### ec2-capacity-watcher.sh

Use when starting a GPU instance (g5, g4dn, p3, etc.) fails with `InsufficientInstanceCapacity`. Retries every N seconds until capacity frees up, then starts the instance and reports the public IP.

**Options:** `-i` instance ID (required), `-p` profile, `-r` region, `-t` instance type (change before watching), `-s` interval seconds, `-m` max attempts.

**Launch in a background terminal pane** (Zellij/tmux) so the agent session stays free:

```bash
# Zellij
zellij action new-pane --name "EC2 Watcher" -- bash <scripts>/ec2-capacity-watcher.sh -i i-xxx -p myprofile -t g5.2xlarge

# tmux
tmux split-window -h "bash <scripts>/ec2-capacity-watcher.sh -i i-xxx -p myprofile -t g5.2xlarge"

# Background (with log)
nohup bash <scripts>/ec2-capacity-watcher.sh -i i-xxx -p myprofile > /tmp/ec2-watcher.log 2>&1 &
```

**Stop the watcher:**
```bash
pkill -f ec2-capacity-watcher.sh
```

For detailed service references, see [references/](references/).

## CloudWatch & Logs

```bash
# List log groups
aws logs describe-log-groups --query 'logGroups[].logGroupName'

# Tail logs (live)
aws logs tail /aws/lambda/<name> --follow --since 1h

# Get metrics
aws cloudwatch get-metric-statistics --namespace AWS/EC2 \
  --metric-name CPUUtilization --dimensions Name=InstanceId,Value=i-xxx \
  --start-time $(date -u -v-1H +%Y-%m-%dT%H:%M:%S) --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 300 --statistics Average
```

## Cost & Billing

```bash
# Month-to-date costs
aws ce get-cost-and-usage \
  --time-period Start=$(date +%Y-%m-01),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY --metrics BlendedCost \
  --group-by Type=DIMENSION,Key=SERVICE

# Forecast
aws ce get-cost-forecast \
  --time-period Start=$(date +%Y-%m-%d),End=$(date -v+30d +%Y-%m-%d) \
  --metric BLENDED_COST --granularity MONTHLY
```

## Rules

- **Always verify identity** before destructive operations — `aws sts get-caller-identity`
- **Always use `--dry-run`** when available (EC2 create/run commands) before the real call
- **Never hardcode credentials** — use profiles, SSO, or instance roles
- **Use `--query` + `--output table`** for human-readable summaries; `--output json` for parsing
- **Tag everything** — at minimum `Name`, `Environment`, `Owner`
- **Check region** — add `--region <region>` explicitly when operating across regions
- **Do NOT delete S3 buckets** without listing contents first and confirming with user
- **Do NOT modify IAM policies** without showing the diff to the user first
- **Do NOT terminate instances** without confirming instance ID and Name tag with user
- **Prefer `aws s3`** (high-level) over `aws s3api` (low-level) for common file operations

## Verification

After any mutating operation, confirm success:

```bash
# After starting an instance
aws ec2 describe-instances --instance-ids i-xxx \
  --query 'Reservations[].Instances[].State.Name' --output text
# Expected: running

# After uploading to S3
aws s3 ls s3://bucket/key
# Expected: file listed with correct size

# After deploying a stack
aws cloudformation describe-stacks --stack-name <name> \
  --query 'Stacks[0].StackStatus' --output text
# Expected: CREATE_COMPLETE or UPDATE_COMPLETE
```

## Tips

- Use `aws <service> help` for built-in docs on any command
- Use `aws <service> <command> help` for specific command options
- Pipe JSON output through `jq` for complex client-side filtering
- Use `--no-cli-pager` to suppress the pager for scripted operations
- Use `AWS_PAGER=""` env var to globally disable paging
- Add `--cli-read-timeout 0` for long-running operations (large S3 uploads)
- Use `aws configure set region <region>` to change default region
