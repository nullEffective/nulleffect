# NullEffect Deployment Fix

## Problem
The nulleffect.com frontend shows "Error: Failed to fetch" because:
1. Backend service wasn't properly deployed (Terraform state shows "tainted")
2. Frontend was hardcoded to `http://localhost:8080` instead of the actual backend URL

## Solution
Updated the deployment process to:
1. Deploy backend first and get its Cloud Run URL
2. Build frontend with the backend URL as a build argument
3. Deploy frontend with correct API configuration

## Files Changed

### 1. `/frontend/Dockerfile`
- Added `ARG VITE_API_BASE` to accept the backend URL at build time
- Added `ENV VITE_API_BASE=$VITE_API_BASE` to pass it to Vite

### 2. `/frontend/cloudbuild.yaml` (NEW)
- Configures Google Cloud Build to pass the backend URL as a build argument

### 3. `/scripts/deploy_gcp.sh`
- Updated to deploy backend first
- Captures backend URL
- Passes backend URL to frontend build via cloudbuild.yaml
- Added better logging and error messages

## How to Deploy

### Option 1: Run from Terminal
```bash
cd /Users/stephenleonard/git/nulleffect/nulleffect
./scripts/deploy_gcp.sh
```

### Option 2: Double-click Launcher
Double-click: `/Users/stephenleonard/git/claude/deploy_nulleffect.command`

## What Happens During Deployment

1. **Enable GCP APIs** - Ensures Cloud Run, Artifact Registry, etc. are enabled
2. **Build Backend** - Creates Docker image and pushes to Artifact Registry
3. **Deploy Backend** - Deploys to Cloud Run and gets the service URL
4. **Build Frontend** - Creates Docker image with `VITE_API_BASE` set to backend URL
5. **Deploy Frontend** - Deploys to Cloud Run
6. **Test & Report** - Tests backend ping endpoint and shows URLs

## Expected Output

```
Backend:  https://nulleffect-backend-xxxxx-uc.a.run.app
Frontend: https://nulleffect-frontend-xxxxx-uc.a.run.app
```

## Testing

After deployment:
1. Visit the frontend URL - should show "NullEffect Frontend"
2. Check that "Ping response" shows a timestamp instead of "Error: Failed to fetch"

## Pointing nulleffect.com to Your App

You have two options:

### Option 1: DNS CNAME (Simple)
Point your DNS CNAME record to the frontend Cloud Run URL:
```
CNAME: nulleffect.com → nulleffect-frontend-xxxxx-uc.a.run.app
```

### Option 2: Cloud Run Domain Mapping (Better)
```bash
gcloud run domain-mappings create \
    --service=nulleffect-frontend \
    --domain=nulleffect.com \
    --region=us-central1
```

Then follow the instructions to add DNS records.

## Terraform Integration

The Terraform configuration needs updating to use the dynamic backend URL. You can:
1. Use terraform outputs to get the backend URL
2. Update the frontend deployment in terraform to use the backend URL

Currently, the shell script handles this automatically.

## Troubleshooting

### "Failed to fetch" still showing
- Make sure both services deployed successfully
- Check that backend is responding: `curl https://your-backend-url/ping`
- Verify frontend was built with correct VITE_API_BASE

### Backend not responding
- Check Cloud Run logs: `gcloud run services logs read nulleffect-backend --region=us-central1`
- Verify the FastAPI app is running on port 8080

### Frontend showing blank page
- Check browser console for errors
- Verify the Vite build completed successfully
- Check Cloud Run logs: `gcloud run services logs read nulleffect-frontend --region=us-central1`

## Next Steps

1. Run the deployment script
2. Test the frontend URL
3. Update nulleffect.com DNS
4. Consider setting up:
   - Custom domain SSL
   - Cloud CDN for better performance
   - Cloud Armor for DDoS protection
   - Monitoring/alerts

## Architecture

```
User
  ↓
nulleffect.com (DNS)
  ↓
Cloud Run: nulleffect-frontend
  ↓ (fetch)
Cloud Run: nulleffect-backend (FastAPI)
```

## Commands Cheatsheet

```bash
# Deploy everything
./scripts/deploy_gcp.sh

# Check service status
gcloud run services list --region=us-central1

# View logs
gcloud run services logs read nulleffect-backend --region=us-central1
gcloud run services logs read nulleffect-frontend --region=us-central1

# Get service URLs
./scripts/print_status.sh

# Delete services (if needed)
gcloud run services delete nulleffect-backend --region=us-central1
gcloud run services delete nulleffect-frontend --region=us-central1
```
