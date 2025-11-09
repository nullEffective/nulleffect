#!/usr/bin/env bash
set -euo pipefail


PROJECT_ID="${1:-nulleffect-qa}"
REGION="${2:-us-central1}"
gcloud config set project "$PROJECT_ID" >/dev/null
for SVC in nulleffect-backend nulleffect-frontend; do
  echo "==> ${SVC} URL:"
  gcloud run services describe "$SVC" --region "$REGION" --format='value(uri)'
done
