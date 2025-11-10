#!/bin/bash

# Test NullEffect services
# Hits the endpoints and shows the responses

PROJECT_ID="nulleffect-qa"
REGION="us-central1"

echo "========================================"
echo "Testing NullEffect Services"
echo "========================================"
echo ""

gcloud config set project "$PROJECT_ID" 2>/dev/null

# Get URLs
BACKEND_URL=$(gcloud run services describe nulleffect-backend --region="$REGION" --format='value(status.url)' 2>/dev/null || echo "")
FRONTEND_URL=$(gcloud run services describe nulleffect-frontend --region="$REGION" --format='value(status.url)' 2>/dev/null || echo "")

if [ -z "$BACKEND_URL" ]; then
    echo "❌ Backend not deployed"
    exit 1
fi

if [ -z "$FRONTEND_URL" ]; then
    echo "❌ Frontend not deployed"
    exit 1
fi

echo "Backend URL:  $BACKEND_URL"
echo "Frontend URL: $FRONTEND_URL"
echo ""

# Test backend
echo "========================================"
echo "Testing Backend /ping"
echo "========================================"
echo ""
echo "Request: GET ${BACKEND_URL}/ping"
echo ""
echo "Response:"

BACKEND_RESPONSE=$(curl -sf "${BACKEND_URL}/ping" 2>&1)
BACKEND_STATUS=$?

if [ $BACKEND_STATUS -eq 0 ]; then
    echo "$BACKEND_RESPONSE" | jq . 2>/dev/null || echo "$BACKEND_RESPONSE"
    echo ""
    echo "✅ Backend is working!"
else
    echo "$BACKEND_RESPONSE"
    echo ""
    echo "❌ Backend failed"
fi

echo ""
echo "========================================"
echo "Testing Frontend"
echo "========================================"
echo ""
echo "Request: GET ${FRONTEND_URL}"
echo ""

FRONTEND_STATUS=$(curl -sf -o /dev/null -w "%{http_code}" "$FRONTEND_URL" 2>&1)

if [ "$FRONTEND_STATUS" = "200" ]; then
    echo "✅ Frontend is working! (HTTP 200)"
    echo ""
    echo "Visit in browser: $FRONTEND_URL"
else
    echo "❌ Frontend returned: HTTP $FRONTEND_STATUS"
fi

echo ""
echo "========================================"
echo "Test Complete"
echo "========================================"
echo ""
