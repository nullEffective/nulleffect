#!/usr/bin/env bash
set -euo pipefail

# Deploy NullEffect to Google Cloud Platform
# Usage: ./scripts/deploy_gcp.sh [PROJECT_ID] [REGION] [REPO_ID]

PROJECT_ID="${1:-nulleffect-qa}"
REGION="${2:-us-central1}"
REPO_ID="${3:-nulleffect-docker}"

echo "========================================"
echo "NullEffect GCP Deployment"
echo "========================================"
echo "Project ID: $PROJECT_ID"
echo "Region:     $REGION"
echo "Repo ID:    $REPO_ID"
echo ""

# Set the active project
gcloud config set project "$PROJECT_ID"

# Enable required APIs
echo "Enabling required GCP APIs..."
gcloud services enable \
    run.googleapis.com \
    artifactregistry.googleapis.com \
    iam.googleapis.com \
    cloudbuild.googleapis.com

echo ""
echo "========================================"
echo "Step 1: Deploy Backend"
echo "========================================"
echo ""

BACKEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_ID}/backend:latest"

echo "Building backend image: $BACKEND_IMAGE"
gcloud builds submit backend --tag "$BACKEND_IMAGE"

echo ""
echo "Deploying backend to Cloud Run..."
gcloud run deploy nulleffect-backend \
    --image "$BACKEND_IMAGE" \
    --region "$REGION" \
    --allow-unauthenticated \
    --port 8080 \
    --platform managed \
    --min-instances 0 \
    --max-instances 3

# Get the backend URL
BACKEND_URL=$(gcloud run services describe nulleffect-backend \
    --region "$REGION" \
    --format='value(status.url)')

echo ""
echo "✅ Backend deployed successfully!"
echo "   Backend URL: $BACKEND_URL"

echo ""
echo "========================================"
echo "Step 2: Deploy Frontend"
echo "========================================"
echo ""

FRONTEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_ID}/frontend:latest"

echo "Building frontend image with API base: $BACKEND_URL"
gcloud builds submit frontend \
    --config=frontend/cloudbuild.yaml \
    --substitutions="_IMAGE_NAME=${FRONTEND_IMAGE},_VITE_API_BASE=${BACKEND_URL}"

echo ""
echo "Deploying frontend to Cloud Run..."
gcloud run deploy nulleffect-frontend \
    --image "$FRONTEND_IMAGE" \
    --region "$REGION" \
    --allow-unauthenticated \
    --port 8080 \
    --platform managed \
    --min-instances 0 \
    --max-instances 3

# Get the frontend URL
FRONTEND_URL=$(gcloud run services describe nulleffect-frontend \
    --region "$REGION" \
    --format='value(status.url)')

echo ""
echo "✅ Frontend deployed successfully!"
echo "   Frontend URL: $FRONTEND_URL"

echo ""
echo "========================================"
echo "Deployment Summary"
echo "========================================"
echo ""
echo "Backend:  $BACKEND_URL"
echo "Frontend: $FRONTEND_URL"
echo ""

# Test the backend
echo "Testing backend /ping endpoint..."
if curl -sf "${BACKEND_URL}/ping" > /dev/null 2>&1; then
    echo "✅ Backend is responding"
    curl -s "${BACKEND_URL}/ping" | jq . 2>/dev/null || curl -s "${BACKEND_URL}/ping"
else
    echo "⚠️  Backend is not responding yet (may take a moment to start)"
fi

echo ""
echo "========================================"
echo "Next Steps"
echo "========================================"
echo ""
echo "1. Test your frontend: $FRONTEND_URL"
echo "2. Update nulleffect.com DNS to point to the frontend URL"
echo "3. Set up domain mapping in Cloud Run (optional):"
echo "   gcloud run domain-mappings create --service=nulleffect-frontend --domain=nulleffect.com --region=$REGION"
echo ""
