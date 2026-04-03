# EC2 Advanced Reference

## Launch Instances

```bash
# Launch instance
aws ec2 run-instances \
  --image-id ami-xxx \
  --instance-type t3.medium \
  --key-name my-key \
  --security-group-ids sg-xxx \
  --subnet-id subnet-xxx \
  --count 1 \
  --tag-specifications 'ResourceType=instance,Tags=[{Key=Name,Value=my-instance},{Key=Environment,Value=dev}]' \
  --dry-run  # Remove after confirming

# With user data script
aws ec2 run-instances \
  --image-id ami-xxx \
  --instance-type t3.medium \
  --user-data file://setup.sh \
  ...

# With IAM instance profile
aws ec2 run-instances \
  --iam-instance-profile Name=my-profile \
  ...
```

## AMIs

```bash
# List your AMIs
aws ec2 describe-images --owners self \
  --query 'Images[].{ID:ImageId,Name:Name,Created:CreationDate}' --output table

# Find Amazon Linux 2023 AMI
aws ec2 describe-images --owners amazon \
  --filters "Name=name,Values=al2023-ami-*-x86_64" \
  --query 'sort_by(Images, &CreationDate)[-1].{ID:ImageId,Name:Name}'

# Find Ubuntu AMI
aws ssm get-parameter \
  --name /aws/service/canonical/ubuntu/server/22.04/stable/current/amd64/hvm/ebs-gp2/ami-id \
  --query Parameter.Value --output text

# Create AMI from instance
aws ec2 create-image --instance-id i-xxx --name "my-backup-$(date +%Y%m%d)" \
  --no-reboot
```

## Volumes & Snapshots

```bash
# List volumes
aws ec2 describe-volumes \
  --query 'Volumes[].{ID:VolumeId,Size:Size,State:State,AZ:AvailabilityZone,Instance:Attachments[0].InstanceId}' \
  --output table

# Create snapshot
aws ec2 create-snapshot --volume-id vol-xxx --description "Backup $(date +%Y%m%d)"

# List snapshots
aws ec2 describe-snapshots --owner-ids self \
  --query 'Snapshots[].{ID:SnapshotId,Volume:VolumeId,Size:VolumeSize,State:State,Created:StartTime}' \
  --output table
```

## Networking

```bash
# List VPCs
aws ec2 describe-vpcs \
  --query 'Vpcs[].{ID:VpcId,CIDR:CidrBlock,Name:Tags[?Key==`Name`]|[0].Value}' --output table

# List subnets
aws ec2 describe-subnets --filters "Name=vpc-id,Values=vpc-xxx" \
  --query 'Subnets[].{ID:SubnetId,AZ:AvailabilityZone,CIDR:CidrBlock,Public:MapPublicIpOnLaunch}' \
  --output table

# Elastic IPs
aws ec2 describe-addresses --output table
aws ec2 allocate-address --domain vpc
aws ec2 associate-address --instance-id i-xxx --allocation-id eipalloc-xxx
aws ec2 release-address --allocation-id eipalloc-xxx
```

## Security Groups

```bash
# Create security group
aws ec2 create-security-group --group-name my-sg \
  --description "My security group" --vpc-id vpc-xxx

# Add rules
aws ec2 authorize-security-group-ingress --group-id sg-xxx \
  --ip-permissions '[
    {"IpProtocol":"tcp","FromPort":443,"ToPort":443,"IpRanges":[{"CidrIp":"0.0.0.0/0","Description":"HTTPS"}]},
    {"IpProtocol":"tcp","FromPort":22,"ToPort":22,"IpRanges":[{"CidrIp":"10.0.0.0/8","Description":"SSH from VPC"}]}
  ]'

# Remove rule
aws ec2 revoke-security-group-ingress --group-id sg-xxx \
  --protocol tcp --port 22 --cidr 0.0.0.0/0

# View rules
aws ec2 describe-security-groups --group-ids sg-xxx \
  --query 'SecurityGroups[0].IpPermissions'
```
