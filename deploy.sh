#!/usr/bin/env bash
set -euo pipefail

STACK_NAME="personalnode-site"
TEMPLATE_FILE="cloudformation.yaml"
CHANGESET_NAME="deploy-$(date +%s)"

# Check for bucket name argument
if [ -z "${1:-}" ]; then
  echo "Usage: ./deploy.sh <bucket-name>"
  echo "Example: ./deploy.sh personalnode-protocol-site"
  exit 1
fi

BUCKET_NAME="$1"

# Check AWS CLI is available
if ! command -v aws &> /dev/null; then
  echo "Error: AWS CLI is not installed. Install it from https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html"
  exit 1
fi

# Build
echo "Building..."
npm run build

# Determine if this is a create or update
if aws cloudformation describe-stacks --stack-name "$STACK_NAME" > /dev/null 2>&1; then
  CHANGESET_TYPE="UPDATE"
else
  CHANGESET_TYPE="CREATE"
fi

# Create change set
echo ""
echo "Creating change set ($CHANGESET_TYPE)..."
aws cloudformation create-change-set \
  --stack-name "$STACK_NAME" \
  --template-body "file://$TEMPLATE_FILE" \
  --change-set-name "$CHANGESET_NAME" \
  --change-set-type "$CHANGESET_TYPE" \
  --parameters "ParameterKey=BucketName,ParameterValue=$BUCKET_NAME" \
  > /dev/null

# Wait for change set to be created
echo "Waiting for change set..."
aws cloudformation wait change-set-create-complete \
  --stack-name "$STACK_NAME" \
  --change-set-name "$CHANGESET_NAME" 2>/dev/null || true

# Show changes
STATUS=$(aws cloudformation describe-change-set \
  --stack-name "$STACK_NAME" \
  --change-set-name "$CHANGESET_NAME" \
  --query "Status" --output text)

if [ "$STATUS" = "FAILED" ]; then
  REASON=$(aws cloudformation describe-change-set \
    --stack-name "$STACK_NAME" \
    --change-set-name "$CHANGESET_NAME" \
    --query "StatusReason" --output text)

  # No changes needed
  if echo "$REASON" | grep -q "didn't contain changes"; then
    echo "No infrastructure changes needed."
    aws cloudformation delete-change-set \
      --stack-name "$STACK_NAME" \
      --change-set-name "$CHANGESET_NAME" > /dev/null
  else
    echo "Change set failed: $REASON"
    aws cloudformation delete-change-set \
      --stack-name "$STACK_NAME" \
      --change-set-name "$CHANGESET_NAME" > /dev/null
    exit 1
  fi
else
  echo ""
  echo "=== Proposed Changes ==="
  aws cloudformation describe-change-set \
    --stack-name "$STACK_NAME" \
    --change-set-name "$CHANGESET_NAME" \
    --query "Changes[].ResourceChange.{Action:Action,Resource:ResourceType,LogicalId:LogicalResourceId}" \
    --output table
  echo ""

  read -p "Apply these changes? (y/N) " -n 1 -r
  echo ""

  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled. Cleaning up change set..."
    aws cloudformation delete-change-set \
      --stack-name "$STACK_NAME" \
      --change-set-name "$CHANGESET_NAME" > /dev/null
    exit 0
  fi

  # Execute change set
  echo "Applying changes..."
  aws cloudformation execute-change-set \
    --stack-name "$STACK_NAME" \
    --change-set-name "$CHANGESET_NAME"

  echo "Waiting for stack to complete..."
  if [ "$CHANGESET_TYPE" = "CREATE" ]; then
    aws cloudformation wait stack-create-complete --stack-name "$STACK_NAME"
  else
    aws cloudformation wait stack-update-complete --stack-name "$STACK_NAME"
  fi

  echo "Stack $CHANGESET_TYPE complete."
fi

# Sync build output to S3
echo ""
echo "Uploading to s3://$BUCKET_NAME..."
aws s3 sync dist/ "s3://$BUCKET_NAME" --delete

# Invalidate CloudFront cache
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='DistributionId'].OutputValue" \
  --output text)

if [ "$DISTRIBUTION_ID" != "None" ] && [ -n "$DISTRIBUTION_ID" ]; then
  echo "Invalidating CloudFront cache..."
  aws cloudfront create-invalidation \
    --distribution-id "$DISTRIBUTION_ID" \
    --paths "/*" > /dev/null
fi

# Print the website URL
WEBSITE_URL=$(aws cloudformation describe-stacks \
  --stack-name "$STACK_NAME" \
  --query "Stacks[0].Outputs[?OutputKey=='WebsiteURL'].OutputValue" \
  --output text)

echo ""
echo "Deployed to: $WEBSITE_URL"
