#!/bin/bash

# Delete NullEffect services from Cloud Run
# Use with caution - this will delete your deployed services!

PROJECT_ID="${1:-nulleffect-qa}"
REGION="${2:-us-central1}"

echo "========================================"
echo "⚠️  WARNING: Service Deletion"
echo "========================================"
echo ""
echo "This will DELETE the following services:"
echo "  - nulleffect-backend"
echo "  - nulleffect-frontend"
echo ""
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo ""
read -p "Are you sure? Type 'yes' to continue: " CONFIRM

if [ "$CONFIRM" != "yes" ]; then
    echo "Cancelled."
    exit 0
fi

gcloud config set project "$PROJECT_ID"

echo ""
echo "Deleting backend service..."
gcloud run services delete nulleffect-backend \
    --region="$REGION" \
    --quiet

echo ""
echo "Deleting frontend service..."
gcloud run services delete nulleffect-frontend \
    --region="$REGION" \
    --quiet

echo ""
echo "✅ Services deleted!"
echo ""
echo "To redeploy, run:"
echo "  ./scripts/deploy_gcp.sh"
echo ""
