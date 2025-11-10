#!/bin/bash

# Check current NullEffect deployment status
# Shows whether backend and frontend are deployed and responding

PROJECT_ID="nulleffect-qa"
REGION="us-central1"

echo "========================================"
echo "NullEffect Deployment Status"
echo "========================================"
echo ""

gcloud config set project "$PROJECT_ID" 2>/dev/null

echo "Checking Cloud Run services..."
echo ""

# Check backend
BACKEND_URL=$(gcloud run services describe nulleffect-backend --region="$REGION" --format='value(status.url)' 2>/dev/null || echo "")
if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend: NOT DEPLOYED"
else
    echo "✅ Backend: DEPLOYED"
    echo "   URL: $BACKEND_URL"
    echo -n "   Status: "
    if curl -sf "${BACKEND_URL}/ping" > /dev/null 2>&1; then
        echo "RESPONDING ✅"
        echo -n "   Response: "
        curl -s "${BACKEND_URL}/ping" | jq -r '.response' 2>/dev/null || echo "OK"
    else
        echo "NOT RESPONDING ⚠️"
    fi
fi

echo ""

# Check frontend
FRONTEND_URL=$(gcloud run services describe nulleffect-frontend --region="$REGION" --format='value(status.url)' 2>/dev/null || echo "")
if [ -z "$FRONTEND_URL" ]; then
    echo "❌ Frontend: NOT DEPLOYED"
else
    echo "✅ Frontend: DEPLOYED"
    echo "   URL: $FRONTEND_URL"
    echo -n "   Status: "
    if curl -sf "$FRONTEND_URL" > /dev/null 2>&1; then
        echo "RESPONDING ✅"
    else
        echo "NOT RESPONDING ⚠️"
    fi
fi

echo ""
echo "========================================"
echo ""

if [ -z "$BACKEND_URL" ] || [ -z "$FRONTEND_URL" ]; then
    echo "⚠️  One or more services not deployed."
    echo ""
    echo "To deploy, run:"
    echo "  cd /Users/stephenleonard/git/nulleffect/nulleffect"
    echo "  ./scripts/deploy_gcp.sh"
    echo ""
    echo "Or double-click:"
    echo "  scripts/deploy_launcher.command"
else
    echo "✅ Both services are deployed!"
    echo ""
    echo "Test your app at: $FRONTEND_URL"
fi

echo ""
read -p "Press Enter to close..."
