#!/bin/bash

# Update environment variables for deployed services
# Useful for updating configuration without rebuilding

PROJECT_ID="${1:-nulleffect-qa}"
REGION="${2:-us-central1}"

if [ -z "$3" ]; then
    echo "Usage: $0 [PROJECT_ID] [REGION] SERVICE ENV_VAR=VALUE [ENV_VAR2=VALUE2 ...]"
    echo ""
    echo "Examples:"
    echo "  $0 nulleffect-qa us-central1 backend LOG_LEVEL=debug"
    echo "  $0 nulleffect-qa us-central1 frontend API_TIMEOUT=30"
    echo ""
    exit 1
fi

SERVICE="$3"
shift 3

# Validate service name
if [ "$SERVICE" != "backend" ] && [ "$SERVICE" != "frontend" ]; then
    echo "Error: SERVICE must be 'backend' or 'frontend'"
    exit 1
fi

SERVICE_NAME="nulleffect-${SERVICE}"

echo "========================================"
echo "Updating Environment Variables"
echo "========================================"
echo "Service: $SERVICE_NAME"
echo "Region:  $REGION"
echo ""

gcloud config set project "$PROJECT_ID"

# Build the update command
ENV_VARS=""
for VAR in "$@"; do
    if [ -z "$ENV_VARS" ]; then
        ENV_VARS="$VAR"
    else
        ENV_VARS="$ENV_VARS,$VAR"
    fi
    echo "Setting: $VAR"
done

echo ""
echo "Updating service..."

gcloud run services update "$SERVICE_NAME" \
    --region="$REGION" \
    --update-env-vars="$ENV_VARS"

echo ""
echo "✅ Environment variables updated!"
echo ""
echo "Note: Service will restart with new variables"
echo ""
