# NullEffect Scripts

This directory contains deployment, management, and utility scripts for the NullEffect project.

## Quick Start

```bash
# First time setup - make all scripts executable
./make_executable.sh

# Deploy to Google Cloud
./deploy_gcp.sh

# Check deployment status
./check_status.command

# View service logs
./view_logs.sh both
```

## Scripts Overview

### 🚀 Deployment Scripts

#### `deploy_gcp.sh`
Main deployment script. Deploys backend first, captures URL, then deploys frontend with backend URL.

**Usage:**
```bash
./deploy_gcp.sh [PROJECT_ID] [REGION] [REPO_ID]
./deploy_gcp.sh                           # Uses defaults
./deploy_gcp.sh my-project us-east1       # Custom project and region
```

**What it does:**
1. Enables required GCP APIs
2. Builds and deploys backend to Cloud Run
3. Captures backend URL
4. Builds frontend with backend URL as build arg
5. Deploys frontend to Cloud Run
6. Tests endpoints and displays URLs

**Default values:**
- PROJECT_ID: `nulleffect-qa`
- REGION: `us-central1`
- REPO_ID: `nulleffect-docker`

---

#### `deploy_launcher.command`
Double-click wrapper for `deploy_gcp.sh`. Convenient for macOS users.

**Usage:** Double-click the file in Finder

---

### 📊 Status & Monitoring Scripts

#### `check_status.command`
Check if services are deployed and responding.

**Usage:**
```bash
./check_status.command    # Or double-click on macOS
```

**Shows:**
- Whether backend is deployed
- Whether frontend is deployed
- Service URLs
- Response status (responding or not)
- Backend ping response

---

#### `print_status.sh`
Print service URLs only (simpler version of check_status).

**Usage:**
```bash
./print_status.sh [PROJECT_ID] [REGION]
./print_status.sh                    # Uses defaults
./print_status.sh my-project us-east1
```

---

#### `view_logs.sh`
View Cloud Run logs for your services.

**Usage:**
```bash
./view_logs.sh [backend|frontend|both] [number_of_lines]

# Examples:
./view_logs.sh backend 100    # Last 100 backend log lines
./view_logs.sh frontend       # Last 50 frontend log lines (default)
./view_logs.sh both 200       # Last 200 lines from both services
```

---

#### `test_services.sh`
Test both services by hitting their endpoints.

**Usage:**
```bash
./test_services.sh
```

**Tests:**
- Backend `/ping` endpoint
- Frontend home page
- Shows HTTP status codes and responses

---

### 🔧 Management Scripts

#### `delete_services.sh`
Delete deployed Cloud Run services. **Use with caution!**

**Usage:**
```bash
./delete_services.sh [PROJECT_ID] [REGION]
```

**Prompts for confirmation** before deleting:
- nulleffect-backend
- nulleffect-frontend

---

#### `update_env.sh`
Update environment variables for a deployed service without rebuilding.

**Usage:**
```bash
./update_env.sh [PROJECT_ID] [REGION] SERVICE ENV_VAR=VALUE [ENV_VAR2=VALUE2 ...]

# Examples:
./update_env.sh nulleffect-qa us-central1 backend LOG_LEVEL=debug
./update_env.sh nulleffect-qa us-central1 frontend API_TIMEOUT=30 MAX_RETRIES=5
```

**Note:** Service will restart with new variables.

---

### 🛠️ Setup Scripts

#### `make_executable.sh`
Make all scripts in this directory executable.

**Usage:**
```bash
./make_executable.sh    # Or: bash make_executable.sh
```

**Run this:**
- After cloning the repo
- After pulling new scripts
- If you get "permission denied" errors

---

#### `setup_local.sh`
Set up local development environment.

**Usage:**
```bash
./setup_local.sh
```

**Sets up:**
- Python virtual environment for backend
- Node.js dependencies for frontend
- Local configuration

---

#### `build_local.sh`
Build Docker images locally (without deploying).

**Usage:**
```bash
./build_local.sh
```

**Builds:**
- Backend Docker image
- Frontend Docker image (with localhost backend)

---

#### `terraform_init_apply.sh`
Initialize and apply Terraform configuration.

**Usage:**
```bash
./terraform_init_apply.sh
```

---

#### `gh_set_secrets.sh`
Set up GitHub secrets for CI/CD.

**Usage:**
```bash
./gh_set_secrets.sh
```

---

## Common Workflows

### First Time Deployment
```bash
# 1. Make scripts executable
./make_executable.sh

# 2. Deploy everything
./deploy_gcp.sh

# 3. Check it worked
./check_status.command
```

### Regular Development Workflow
```bash
# Make changes to code...

# Deploy changes
./deploy_gcp.sh

# Check logs if something's wrong
./view_logs.sh both

# Test endpoints
./test_services.sh
```

### Debugging Issues
```bash
# Check what's deployed
./check_status.command

# View recent logs
./view_logs.sh both 100

# Test endpoints
./test_services.sh

# If needed, view more logs
./view_logs.sh backend 500
```

### Complete Reset
```bash
# Delete everything
./delete_services.sh

# Redeploy fresh
./deploy_gcp.sh
```

---

## Script Dependencies

All scripts require:
- `gcloud` CLI installed and configured
- Active GCP project with billing enabled
- Appropriate IAM permissions

Some scripts additionally require:
- `jq` (for JSON parsing) - Install: `brew install jq`
- `curl` (usually pre-installed)

---

## Environment Variables

Scripts use these defaults (can be overridden with arguments):

```bash
PROJECT_ID="nulleffect-qa"
REGION="us-central1"
REPO_ID="nulleffect-docker"
```

---

## Troubleshooting

### "Permission denied" errors
```bash
./make_executable.sh
```

### "Command not found: gcloud"
Install Google Cloud SDK:
```bash
brew install google-cloud-sdk
gcloud auth login
gcloud config set project nulleffect-qa
```

### "Service not found" errors
Services may not be deployed yet:
```bash
./deploy_gcp.sh
```

### Build or deployment failures
Check logs:
```bash
./view_logs.sh both 200
```

View build logs in GCP Console:
https://console.cloud.google.com/cloud-build/builds

---

## Adding New Scripts

When adding new scripts:

1. Create the script in this directory
2. Add a descriptive header comment
3. Make it executable: `chmod +x new_script.sh`
4. Update this README with documentation
5. Add to `.gitignore` if it contains secrets

---

## File Organization

```
scripts/
├── README.md                     # This file
├── make_executable.sh           # Setup: Make scripts executable
├── deploy_gcp.sh               # Main deployment script
├── deploy_launcher.command     # macOS double-click wrapper
├── check_status.command        # Check deployment status
├── print_status.sh            # Print service URLs
├── view_logs.sh               # View Cloud Run logs
├── test_services.sh           # Test endpoints
├── delete_services.sh         # Delete services
├── update_env.sh              # Update environment variables
├── setup_local.sh             # Local dev setup
├── build_local.sh             # Build locally
├── terraform_init_apply.sh    # Terraform deployment
└── gh_set_secrets.sh          # GitHub secrets setup
```

---

## CI/CD Integration

For automated deployments, see:
- `.github/workflows/terraform-apply.yml`
- `.github/workflows/terraform-pr.yml`

GitHub Actions will automatically deploy on push to `main` branch.

---

## Getting Help

- View this README: `less scripts/README.md`
- Check script usage: `./script_name.sh` (no arguments)
- View logs: `./view_logs.sh both 100`
- Full documentation: `../DEPLOYMENT_FIX_README.md`

---

**Happy deploying! 🚀**
