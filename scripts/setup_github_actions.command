#!/bin/bash

# Setup GitHub Actions for NullEffect
# Creates service account and sets up GitHub secrets

set -e

PROJECT_ID="${1:-nulleffect-qa}"
SERVICE_ACCOUNT_NAME="github-actions"
KEY_FILE="github-actions-key.json"

echo "========================================"
echo "GitHub Actions Setup for NullEffect"
echo "========================================"
echo "Project: $PROJECT_ID"
echo "Service Account: $SERVICE_ACCOUNT_NAME"
echo ""

# Set project
gcloud config set project "$PROJECT_ID"

# Check if service account exists
SA_EMAIL="${SERVICE_ACCOUNT_NAME}@${PROJECT_ID}.iam.gserviceaccount.com"
if gcloud iam service-accounts describe "$SA_EMAIL" &>/dev/null; then
    echo "✅ Service account already exists: $SA_EMAIL"
else
    echo "Creating service account..."
    gcloud iam service-accounts create "$SERVICE_ACCOUNT_NAME" \
        --display-name="GitHub Actions" \
        --description="Service account for GitHub Actions CI/CD"
    echo "✅ Service account created"
fi

echo ""
echo "Granting IAM roles..."

# Grant necessary roles
ROLES=(
    "roles/run.admin"
    "roles/iam.serviceAccountUser"
    "roles/artifactregistry.admin"
    "roles/cloudbuild.builds.editor"
    "roles/storage.admin"
)

for ROLE in "${ROLES[@]}"; do
    echo "  Granting $ROLE..."
    gcloud projects add-iam-policy-binding "$PROJECT_ID" \
        --member="serviceAccount:$SA_EMAIL" \
        --role="$ROLE" \
        --quiet >/dev/null
done

echo "✅ All roles granted"

echo ""
echo "Creating service account key..."

# Create key
gcloud iam service-accounts keys create "$KEY_FILE" \
    --iam-account="$SA_EMAIL"

echo "✅ Key created: $KEY_FILE"

echo ""
echo "========================================"
echo "Setup Complete!"
echo "========================================"
echo ""
echo "📋 Next Steps:"
echo ""
echo "1. Add the service account key to GitHub Secrets:"
echo "   a. Copy the key content:"
echo "      cat $KEY_FILE | pbcopy    # macOS"
echo "      cat $KEY_FILE             # Linux"
echo ""
echo "   b. Go to your GitHub repository:"
echo "      https://github.com/YOUR_USERNAME/YOUR_REPO/settings/secrets/actions"
echo ""
echo "   c. Click 'New repository secret'"
echo ""
echo "   d. Add secret:"
echo "      Name: GOOGLE_CREDENTIALS"
echo "      Value: <paste the key content>"
echo ""
echo "2. (Optional) Add other secrets:"
echo "   Name: PROJECT_ID"
echo "   Value: $PROJECT_ID"
echo ""
echo "   Name: REGION"
echo "   Value: us-central1"
echo ""
echo "3. Delete the local key file:"
echo "   rm $KEY_FILE"
echo ""
echo "4. Push to GitHub to trigger deployment:"
echo "   git add ."
echo "   git commit -m 'Add GitHub Actions'"
echo "   git push origin main"
echo ""
echo "⚠️  IMPORTANT: Delete $KEY_FILE after adding to GitHub!"
echo "   Do NOT commit this file to git!"
echo ""
