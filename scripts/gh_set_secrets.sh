#!/usr/bin/env bash
set -euo pipefail


REPO="nullEffective/nulleffect"
PROJECT_ID="${1:-nulleffect-qa}"
REGION="${2:-us-central1}"
SA_KEY_JSON="${3:?path to service account key json required}"
BACKEND_URL="${4:-https://placeholder-backend}"

gh secret set GCP_PROJECT_ID -R "$REPO" -b"$PROJECT_ID"
gh secret set GCP_REGION     -R "$REPO" -b"$REGION"
gh secret set VITE_API_BASE  -R "$REPO" -b"$BACKEND_URL"
gh secret set GCP_SA_KEY     -R "$REPO" < "$SA_KEY_JSON"
