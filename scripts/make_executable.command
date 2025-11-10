#!/bin/bash

# Make all NullEffect scripts executable
# Run this once after cloning the repo or after pulling new scripts

SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

echo "Making NullEffect scripts executable..."
echo "Script directory: $SCRIPT_DIR"
echo ""

# Make all .sh files in scripts directory executable
find "$SCRIPT_DIR" -name "*.sh" -exec chmod +x {} \;

# Make all .command files in scripts directory executable
find "$SCRIPT_DIR" -name "*.command" -exec chmod +x {} \;

echo "✅ All scripts in $SCRIPT_DIR are now executable!"
echo ""
echo "Available scripts:"
echo "  ./deploy_gcp.sh              - Deploy to Google Cloud"
echo "  ./deploy_launcher.command    - Deploy (double-click version)"
echo "  ./check_status.command       - Check deployment status"
echo "  ./print_status.sh            - Print service URLs"
echo "  ./setup_local.sh             - Set up local development"
echo "  ./build_local.sh             - Build locally"
echo ""
