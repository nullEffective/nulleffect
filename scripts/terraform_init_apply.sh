#!/usr/bin/env bash
set -euo pipefail


PROJECT_ID="${1:-nulleffect-qa}"
REGION="${2:-us-central1}"
REPO_ID="${3:-nulleffect-docker}"
pushd terraform >/dev/null
terraform init -input=false
terraform apply -auto-approve -var="project_id=${PROJECT_ID}" -var="region=${REGION}" -var="repo_id=${REPO_ID}"
popd >/dev/null
