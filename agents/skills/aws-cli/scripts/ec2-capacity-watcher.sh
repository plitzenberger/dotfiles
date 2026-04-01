#!/bin/bash
# EC2 Capacity Watcher — polls until an instance can start, then starts it.
#
# Use case: GPU instances (g5, g4dn, p3, etc.) often fail with
# InsufficientInstanceCapacity. This script retries until capacity frees up.
#
# Usage:
#   ec2-capacity-watcher.sh -i <instance-id> [options]
#
# Required:
#   -i INSTANCE_ID    EC2 instance ID to start
#
# Options:
#   -p PROFILE        AWS CLI profile (default: default)
#   -r REGION         AWS region (default: eu-central-1)
#   -t INSTANCE_TYPE  Change instance type before watching (e.g. g5.2xlarge)
#   -s INTERVAL       Seconds between retries (default: 30)
#   -m MAX_ATTEMPTS   Max attempts before giving up (default: unlimited)
#   -h                Show this help
#
# Examples:
#   # Watch existing instance, default profile
#   ec2-capacity-watcher.sh -i i-07c6c8a4a6c155511
#
#   # Watch with profile, upgrade type, retry every 60s
#   ec2-capacity-watcher.sh -i i-07c6c8a4a6c155511 -p craftumsoft-dev -t g5.2xlarge -s 60
#
#   # Give up after 100 attempts
#   ec2-capacity-watcher.sh -i i-07c6c8a4a6c155511 -p craftumsoft-dev -m 100

set -euo pipefail

# ── Defaults ──────────────────────────────────────────────────────────────────
INSTANCE_ID=""
PROFILE="default"
REGION="eu-central-1"
INSTANCE_TYPE=""
INTERVAL=30
MAX_ATTEMPTS=0  # 0 = unlimited

# ── Parse args ────────────────────────────────────────────────────────────────
usage() {
  sed -n '/^# Usage:/,/^$/p' "$0" | sed 's/^# \?//'
  exit 1
}

while getopts "i:p:r:t:s:m:h" opt; do
  case $opt in
    i) INSTANCE_ID="$OPTARG" ;;
    p) PROFILE="$OPTARG" ;;
    r) REGION="$OPTARG" ;;
    t) INSTANCE_TYPE="$OPTARG" ;;
    s) INTERVAL="$OPTARG" ;;
    m) MAX_ATTEMPTS="$OPTARG" ;;
    h) usage ;;
    *) usage ;;
  esac
done

if [ -z "$INSTANCE_ID" ]; then
  echo "❌ Error: -i INSTANCE_ID is required"
  echo ""
  usage
fi

# ── Common AWS args ───────────────────────────────────────────────────────────
AWS_ARGS=(--profile "$PROFILE" --region "$REGION" --no-cli-pager)

# ── Helper: get instance info ─────────────────────────────────────────────────
get_instance_info() {
  aws ec2 describe-instances "${AWS_ARGS[@]}" \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].{Type:InstanceType,State:State.Name,AZ:Placement.AvailabilityZone,Name:Tags[?Key==`Name`]|[0].Value}' \
    --output json
}

# ── Pre-flight checks ────────────────────────────────────────────────────────
echo "🔍 EC2 Capacity Watcher"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Verify AWS access
if ! aws sts get-caller-identity "${AWS_ARGS[@]}" --output json >/dev/null 2>&1; then
  echo "❌ AWS authentication failed. Check profile '$PROFILE' and region '$REGION'."
  echo "   Try: aws sso login --profile $PROFILE"
  exit 1
fi

# Verify instance exists and is stopped
INFO=$(get_instance_info)
CURRENT_STATE=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['State'])")
CURRENT_TYPE=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['Type'])")
INSTANCE_NAME=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin).get('Name') or 'unnamed')")
INSTANCE_AZ=$(echo "$INFO" | python3 -c "import sys,json; print(json.load(sys.stdin)['AZ'])")

if [ "$CURRENT_STATE" = "running" ]; then
  IP=$(aws ec2 describe-instances "${AWS_ARGS[@]}" \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' --output text)
  echo "✅ Instance is already running! IP: $IP"
  exit 0
fi

if [ "$CURRENT_STATE" != "stopped" ]; then
  echo "❌ Instance is in state '$CURRENT_STATE' — must be 'stopped' to watch."
  exit 1
fi

# ── Optional: change instance type ───────────────────────────────────────────
if [ -n "$INSTANCE_TYPE" ] && [ "$INSTANCE_TYPE" != "$CURRENT_TYPE" ]; then
  echo "🔄 Changing instance type: $CURRENT_TYPE → $INSTANCE_TYPE"
  aws ec2 modify-instance-attribute "${AWS_ARGS[@]}" \
    --instance-id "$INSTANCE_ID" \
    --instance-type "$INSTANCE_TYPE"

  # Verify the change
  VERIFY_TYPE=$(aws ec2 describe-instances "${AWS_ARGS[@]}" \
    --instance-ids "$INSTANCE_ID" \
    --query 'Reservations[0].Instances[0].InstanceType' --output text)

  if [ "$VERIFY_TYPE" != "$INSTANCE_TYPE" ]; then
    echo "❌ Failed to change instance type. Current: $VERIFY_TYPE"
    exit 1
  fi
  echo "   ✅ Instance type changed to $INSTANCE_TYPE"
  CURRENT_TYPE="$INSTANCE_TYPE"
fi

# ── Print config ─────────────────────────────────────────────────────────────
echo "   Instance:  $INSTANCE_ID ($INSTANCE_NAME)"
echo "   Type:      $CURRENT_TYPE"
echo "   AZ:        $INSTANCE_AZ"
echo "   Profile:   $PROFILE"
echo "   Interval:  ${INTERVAL}s"
[ "$MAX_ATTEMPTS" -gt 0 ] && echo "   Max tries: $MAX_ATTEMPTS"
echo "   Started:   $(date '+%Y-%m-%d %H:%M:%S')"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# ── Watch loop ────────────────────────────────────────────────────────────────
attempt=0
while true; do
  attempt=$((attempt + 1))

  if [ "$MAX_ATTEMPTS" -gt 0 ] && [ "$attempt" -gt "$MAX_ATTEMPTS" ]; then
    echo ""
    echo "❌ Gave up after $MAX_ATTEMPTS attempts."
    echo "   Instance $INSTANCE_ID ($CURRENT_TYPE) still stopped."
    exit 1
  fi

  echo -n "[$(date +%H:%M:%S)] Attempt #$attempt — "

  output=$(aws ec2 start-instances "${AWS_ARGS[@]}" \
    --instance-ids "$INSTANCE_ID" \
    --output text 2>&1)
  rc=$?

  if [ $rc -eq 0 ]; then
    echo "✅ START SUCCEEDED!"
    echo ""
    echo "⏳ Waiting for instance to reach 'running' state..."

    aws ec2 wait instance-running "${AWS_ARGS[@]}" \
      --instance-ids "$INSTANCE_ID"

    NEW_IP=$(aws ec2 describe-instances "${AWS_ARGS[@]}" \
      --instance-ids "$INSTANCE_ID" \
      --query 'Reservations[0].Instances[0].PublicIpAddress' \
      --output text)

    echo ""
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "🎉 Instance is RUNNING!"
    echo "   Name:      $INSTANCE_NAME"
    echo "   Type:      $CURRENT_TYPE"
    echo "   Public IP: $NEW_IP"
    echo "   AZ:        $INSTANCE_AZ"
    echo ""
    echo "   ⚠️  Update ~/.ssh/config if IP changed"
    echo "   Completed: $(date '+%Y-%m-%d %H:%M:%S')"
    echo "   Attempts:  $attempt"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    exit 0
  else
    if echo "$output" | grep -q "InsufficientInstanceCapacity"; then
      echo "❌ No capacity — retrying in ${INTERVAL}s"
    elif echo "$output" | grep -q "IncorrectInstanceState"; then
      # Instance might be in 'pending' or transitional state
      echo "⏳ Instance in transition — retrying in ${INTERVAL}s"
    else
      echo "⚠️  Unexpected error:"
      echo "   $output"
      echo "   Retrying in ${INTERVAL}s"
    fi
  fi

  sleep "$INTERVAL"
done
