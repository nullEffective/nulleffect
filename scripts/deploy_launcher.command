#!/bin/bash

# Quick deploy launcher for NullEffect
# This is a convenience wrapper that runs the main deploy script

cd /Users/stephenleonard/git/nulleffect/nulleffect

echo "Starting NullEffect deployment..."
echo ""

./scripts/deploy_gcp.sh

echo ""
echo "Deployment script completed!"
echo ""
read -p "Press Enter to close..."
