#!/usr/bin/env bash
set -euo pipefail


PROJECT_ID="${1:-nulleffect-qa}"
REGION="${2:-us-central1}"
REPO_ID="${3:-nulleffect-docker}"

gcloud config set project "$PROJECT_ID"

gcloud services enable run.googleapis.com artifactregistry.googleapis.com iam.googleapis.com cloudbuild.googleapis.com

BACKEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_ID}/backend:latest"
FRONTEND_IMAGE="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_ID}/frontend:latest"

gcloud builds submit backend --tag "$BACKEND_IMAGE"
gcloud run deploy nulleffect-backend --image "$BACKEND_IMAGE" --region "$REGION" --allow-unauthenticated --port 8080

gcloud builds submit frontend --tag "$FRONTEND_IMAGE"
gcloud run deploy nulleffect-frontend --image "$FRONTEND_IMAGE" --region "$REGION" --allow-unauthenticated --port 8080

./scripts/print_status.sh "$PROJECT_ID" "$REGION" || true
