# GitHub Actions CI/CD Workflows

This directory contains GitHub Actions workflows for automated deployment.

## Workflows

### 🚀 `deploy.yml` - Main Deployment Workflow

**Triggers:**
- Push to `main` branch (when backend/ or frontend/ changes)
- Manual trigger via workflow_dispatch

**What it does:**
1. ✅ Builds backend Docker image
2. ✅ Pushes to Artifact Registry
3. ✅ Deploys backend to Cloud Run
4. ✅ Gets backend URL
5. ✅ Builds frontend with backend URL
6. ✅ Pushes frontend to Artifact Registry
7. ✅ Deploys frontend to Cloud Run
8. ✅ Tests both endpoints
9. ✅ Shows deployment summary

**Images tagged with:**
- `latest` - Always points to most recent
- `<commit-sha>` - Specific commit for rollback

**Example:**
```bash
# Push triggers automatic deployment
git add .
git commit -m "Update backend API"
git push origin main
# GitHub Actions builds and deploys automatically
```

---

### 🏗️ `terraform-apply.yml` - Infrastructure Deployment

**Triggers:**
- Push to `main` branch (when terraform/ changes)
- Manual trigger via workflow_dispatch

**What it does:**
1. Runs Terraform to create/update infrastructure
2. Creates Artifact Registry if needed
3. Creates Cloud Run services (infrastructure only)
4. Does NOT build or deploy code

**Use when:**
- Changing infrastructure configuration
- Adding new services
- Modifying scaling settings
- Updating IAM permissions

---

### 🔍 `terraform-pr.yml` - Terraform Validation

**Triggers:**
- Pull requests

**What it does:**
- Validates Terraform syntax
- Runs `terraform plan`
- Posts plan as PR comment

---

## Required GitHub Secrets

Set these in your repository settings (Settings → Secrets and variables → Actions):

| Secret | Description | How to Get |
|--------|-------------|------------|
| `GOOGLE_CREDENTIALS` | GCP Service Account JSON key | See below |
| `PROJECT_ID` | GCP Project ID (optional) | Default: `nulleffect-qa` |
| `REGION` | GCP Region (optional) | Default: `us-central1` |

### Setting Up Google Cloud Credentials

1. **Create Service Account:**
```bash
gcloud iam service-accounts create github-actions \
    --display-name="GitHub Actions"
```

2. **Grant Permissions:**
```bash
PROJECT_ID="nulleffect-qa"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/iam.serviceAccountUser"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/artifactregistry.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
    --member="serviceAccount:github-actions@${PROJECT_ID}.iam.gserviceaccount.com" \
    --role="roles/storage.admin"
```

3. **Create Key:**
```bash
gcloud iam service-accounts keys create github-actions-key.json \
    --iam-account=github-actions@${PROJECT_ID}.iam.gserviceaccount.com
```

4. **Add to GitHub:**
   - Copy contents of `github-actions-key.json`
   - Go to: Repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `GOOGLE_CREDENTIALS`
   - Value: Paste JSON content
   - Click "Add secret"

5. **Clean up local key:**
```bash
rm github-actions-key.json  # Don't commit this!
```

---

## Workflow Usage

### Automatic Deployment (Recommended)

Just push to main:
```bash
git add .
git commit -m "Your changes"
git push origin main
```

GitHub Actions automatically:
1. Detects changes
2. Builds Docker images
3. Deploys to Cloud Run
4. Tests endpoints
5. Reports status

### Manual Deployment

Via GitHub UI:
1. Go to "Actions" tab
2. Select "Deploy to Cloud Run"
3. Click "Run workflow"
4. Choose branch and parameters
5. Click "Run workflow"

Via GitHub CLI:
```bash
gh workflow run deploy.yml
```

---

## Monitoring Deployments

### View Workflow Runs

**In GitHub:**
- Go to "Actions" tab
- Click on a workflow run
- Expand steps to see details

**Via CLI:**
```bash
# List recent runs
gh run list

# View specific run
gh run view <run-id>

# View logs
gh run view <run-id> --log
```

### Deployment Status Badge

Add to your README.md:
```markdown
[![Deploy to Cloud Run](https://github.com/YOUR_USERNAME/nulleffect/actions/workflows/deploy.yml/badge.svg)](https://github.com/YOUR_USERNAME/nulleffect/actions/workflows/deploy.yml)
```

---

## Troubleshooting

### Deployment Fails

**Check logs:**
1. Go to Actions tab
2. Click failed workflow
3. Check which step failed
4. Expand step to see error

**Common issues:**

| Error | Solution |
|-------|----------|
| "Permission denied" | Check service account has correct roles |
| "Image not found" | Verify Artifact Registry exists |
| "Authentication failed" | Check `GOOGLE_CREDENTIALS` secret is set |
| "Resource not found" | Run Terraform first to create infrastructure |

### Backend URL Not Set

If frontend can't reach backend:
1. Check backend deployed successfully
2. Verify backend URL step succeeded
3. Check frontend build received URL
4. Redeploy if needed

### Rollback to Previous Version

```bash
# List images
gcloud artifacts docker images list \
    $REGION-docker.pkg.dev/$PROJECT_ID/$REPO_ID/backend

# Deploy specific version
gcloud run deploy nulleffect-backend \
    --image=$REGION-docker.pkg.dev/$PROJECT_ID/$REPO_ID/backend:<commit-sha> \
    --region=$REGION
```

---

## Development Workflow

### Feature Development

```bash
# 1. Create feature branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit code ...

# 3. Test locally
./scripts/setup_local.sh
# ... test ...

# 4. Push to feature branch (no deployment)
git push origin feature/my-feature

# 5. Create PR (Terraform validation runs)
gh pr create

# 6. Merge to main (automatic deployment)
gh pr merge
```

### Testing Changes

**Before merging:**
- Test locally
- Review Terraform plan in PR
- Check workflow validation passes

**After merging:**
- Watch GitHub Actions run
- Check deployment logs
- Test deployed endpoints
- Verify in browser

---

## Workflow Optimization

### Reduce Build Time

**Cache Docker layers:**
```yaml
- name: Set up Docker Buildx
  uses: docker/setup-buildx-action@v3

- name: Build and push
  uses: docker/build-push-action@v5
  with:
    cache-from: type=gha
    cache-to: type=gha,mode=max
```

### Parallel Deployments

Currently sequential (backend → frontend). Could parallelize if frontend doesn't need backend URL at build time.

### Skip Deployment

Add `[skip ci]` to commit message:
```bash
git commit -m "Update docs [skip ci]"
```

---

## Cost Monitoring

GitHub Actions:
- Free: 2,000 minutes/month for public repos
- Free: 3,000 minutes/month for private repos
- This workflow uses ~5-10 minutes per run

Cloud Build:
- First 120 build-minutes/day are free
- $0.003/build-minute after that

---

## Security Best Practices

✅ **Do:**
- Use service accounts with minimal permissions
- Rotate keys regularly
- Use GitHub Environments for approvals
- Enable branch protection rules

❌ **Don't:**
- Commit service account keys
- Use personal credentials
- Grant excessive permissions
- Disable security checks

---

## Advanced Configuration

### Deploy to Multiple Environments

```yaml
strategy:
  matrix:
    environment: [staging, production]
```

### Manual Approval

```yaml
environment:
  name: production
  url: ${{ steps.deploy.outputs.url }}
```

Then configure environment protection rules in GitHub.

### Slack Notifications

Add to workflow:
```yaml
- name: Notify Slack
  uses: slackapi/slack-github-action@v1
  with:
    webhook-url: ${{ secrets.SLACK_WEBHOOK }}
    payload: |
      {
        "text": "Deployment ${{ job.status }}"
      }
```

---

## Useful Commands

```bash
# List workflows
gh workflow list

# Run workflow
gh workflow run deploy.yml

# View runs
gh run list --workflow=deploy.yml

# Watch current run
gh run watch

# View logs
gh run view --log

# Cancel run
gh run cancel <run-id>

# Re-run failed jobs
gh run rerun <run-id> --failed
```

---

## References

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Google Cloud GitHub Actions](https://github.com/google-github-actions)
- [Cloud Run Documentation](https://cloud.google.com/run/docs)
- [Artifact Registry Documentation](https://cloud.google.com/artifact-registry/docs)

---

**Questions?** Check the [main README](../README.md) or [deployment guide](../DEPLOYMENT_FIX_README.md).
