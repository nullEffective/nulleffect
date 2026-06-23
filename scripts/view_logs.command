#!/bin/bash

# View logs for NullEffect services
# Usage: ./view_logs.sh [backend|frontend|both] [number_of_lines]

PROJECT_ID="nulleffect-qa"
REGION="us-central1"

SERVICE="${1:-both}"
LIMIT="${2:-50}"

gcloud config set project "$PROJECT_ID" 2>/dev/null

case "$SERVICE" in
    backend)
        echo "========================================"
        echo "Backend Logs (last $LIMIT lines)"
        echo "========================================"
        gcloud run services logs read nulleffect-backend \
            --region="$REGION" \
            --limit="$LIMIT"
        ;;
    frontend)
        echo "========================================"
        echo "Frontend Logs (last $LIMIT lines)"
        echo "========================================"
        gcloud run services logs read nulleffect-frontend \
            --region="$REGION" \
            --limit="$LIMIT"
        ;;
    both)
        echo "========================================"
        echo "Backend Logs (last $LIMIT lines)"
        echo "========================================"
        gcloud run services logs read nulleffect-backend \
            --region="$REGION" \
            --limit="$LIMIT"
        echo ""
        echo "========================================"
        echo "Frontend Logs (last $LIMIT lines)"
        echo "========================================"
        gcloud run services logs read nulleffect-frontend \
            --region="$REGION" \
            --limit="$LIMIT"
        ;;
    *)
        echo "Usage: $0 [backend|frontend|both] [number_of_lines]"
        echo ""
        echo "Examples:"
        echo "  $0 backend 100    # Show last 100 backend log lines"
        echo "  $0 frontend       # Show last 50 frontend log lines"
        echo "  $0 both 200       # Show last 200 lines from both services"
        exit 1
        ;;
esac
