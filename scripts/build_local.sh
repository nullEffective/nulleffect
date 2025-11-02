#!/usr/bin/env bash
set -euo pipefail


PROJECT_ID="${1:-nulleffect-qa}"
REGION="${2:-us-central1}"
REPO_ID="${3:-nulleffect-docker}"
BACKEND_IMG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_ID}/backend:latest"
FRONTEND_IMG="${REGION}-docker.pkg.dev/${PROJECT_ID}/${REPO_ID}/frontend:latest"

echo "==> Backend image: $BACKEND_IMG"
pushd backend >/dev/null
docker build -t "$BACKEND_IMG" .
popd >/dev/null

echo "==> Frontend image: $FRONTEND_IMG"
pushd frontend >/dev/null
docker build -t "$FRONTEND_IMG" .
popd >/dev/null
