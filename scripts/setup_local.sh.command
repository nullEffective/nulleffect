#!/usr/bin/env bash
set -euo pipefail


echo "==> Backend (FastAPI)"
pushd backend >/dev/null
python3 -m venv .venv
source .venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
deactivate
popd >/dev/null

echo "==> Frontend (Vite + React)"
pushd frontend >/dev/null
if command -v corepack >/dev/null 2>&1; then corepack enable || true; fi
npm install
popd >/dev/null
