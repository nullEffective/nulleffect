# ✅ GitHub Actions CI/CD - Complete Summary

## Quick Answer to Your Question

**Q: Will Cloud Run execute when I commit to GitHub?**

**A: YES! (After setup)** - Push to `main` branch will automatically:
1. Build Docker images for backend and frontend
2. Push images to Artifact Registry
3. Deploy both services to Cloud Run
4. Test the deployments
5. Report success/failure

---

## 🎯 Current State vs What You Need

### ❌ **Current State** (terraform-apply.yml only)
```
Push to main → Terraform runs → Creates infrastructure
                               → Does NOT build/deploy code
```

**Problem:** Code changes don't deploy automatically

### ✅ **New State** (with deploy.yml)
```
Push to main → GitHub Actions → Builds Docker images
                               → Deploys to Cloud Run
                               → Tests endpoints
                               → ✅ Your code is live!
```

---

## 📋 What I Created For You

### New Files:

1. **`.github/workflows/deploy.yml`** ← Main CI/CD workflow
   - Builds and deploys on every push to `main`
   - Automatically injects backend URL into frontend
   - Tests both services after deployment

2. **`.github/workflows/README.md`** ← Complete CI/CD documentation
   - How workflows work
   - Troubleshooting guide
   - Security best practices

3. **`scripts/setup_github_actions.sh`** ← One-time setup script
   - Creates service account
   - Grants necessary permissions
   - Generates key for GitHub Secrets

---

## 🚀 Setup (One Time Only)

### Step 1: Create Service Account & Key

```bash
cd /Users/stephenleonard/git/nulleffect/nulleffect
./scripts/setup_github_actions.sh
```

This will:
- Create `github-actions` service account
- Grant necessary Cloud Run permissions
- Create `github-actions-key.json`
- Show you next steps

### Step 2: Add Secret to GitHub

1. **Copy the key:**
   ```bash
   cat github-actions-key.json | pbcopy  # macOS
   # Or just: cat github-actions-key.json
   ```

2. **Go to GitHub:**
   - Your repository → Settings → Secrets and variables → Actions
   - Click "New repository secret"

3. **Add the secret:**
   - Name: `GOOGLE_CREDENTIALS`
   - Value: <paste the JSON content>
   - Click "Add secret"

4. **Delete the local key:**
   ```bash
   rm github-actions-key.json  # IMPORTANT!
   ```

### Step 3: Push & Watch It Deploy!

```bash
git add .
git commit -m "Add GitHub Actions CI/CD"
git push origin main
```

Then go to GitHub → Actions tab to watch the deployment! 🎉

---

## 💡 How It Works

### Trigger
```
git push origin main
  ↓
GitHub detects change in backend/ or frontend/
  ↓
Runs .github/workflows/deploy.yml
```

### Workflow Steps

```
1. Checkout code
   ↓
2. Authenticate to GCP
   ↓
3. Build backend Docker image
   ↓
4. Push to Artifact Registry
   ↓
5. Deploy backend to Cloud Run
   ↓
6. Get backend URL
   ↓
7. Build frontend (with backend URL)
   ↓
8. Push frontend to Artifact Registry
   ↓
9. Deploy frontend to Cloud Run
   ↓
10. Test both endpoints
    ↓
11. Report URLs & status
```

**Total time:** ~5-7 minutes

---

## 📊 What Triggers Deployment

### ✅ **WILL deploy:**

```bash
# Any change to backend code
git add backend/
git commit -m "Fix API bug"
git push origin main
# → Deploys!

# Any change to frontend code  
git add frontend/
git commit -m "Update UI"
git push origin main
# → Deploys!

# Changes to both
git add backend/ frontend/
git commit -m "Full stack update"
git push origin main
# → Deploys!
```

### ❌ **Will NOT deploy:**

```bash
# Changes to docs only
git add README.md
git commit -m "Update docs"
git push origin main
# → No deployment (saves time & money)

# Changes to terraform only
git add terraform/
git commit -m "Update infrastructure"
git push origin main
# → Runs terraform-apply.yml instead
```

### 🛑 **Skip deployment:**

```bash
git commit -m "Update README [skip ci]"
git push origin main
# → No workflow runs at all
```

---

## 🔍 Monitoring Deployments

### Via GitHub UI

1. Go to **Actions** tab
2. See list of workflow runs
3. Click one to see details
4. Expand steps to see logs

### Via GitHub CLI

```bash
# Watch current run
gh run watch

# List recent runs
gh run list --workflow=deploy.yml

# View specific run
gh run view 12345678

# View logs
gh run view 12345678 --log
```

### Get Notified

GitHub automatically:
- ✅ Shows green checkmark if successful
- ❌ Shows red X if failed
- 📧 Emails you on failure (configurable)

---

## 🎯 Development Workflow

### Feature Development

```bash
# 1. Create branch
git checkout -b feature/my-feature

# 2. Make changes
# ... edit code ...

# 3. Push to branch (no deployment)
git push origin feature/my-feature

# 4. Create PR
gh pr create

# 5. Review & merge
gh pr merge
# → Automatic deployment to main! 🚀
```

### Testing Before Merge

**Local testing:**
```bash
./scripts/setup_local.sh
# Test backend at localhost:8080
# Test frontend at localhost:5173
```

**Manual deploy to test:**
```bash
# Deploy your branch manually to test
./scripts/deploy_gcp.sh
```

---

## 🔧 Comparison: Manual vs Automatic

### Manual Deployment (what you have now)

```bash
./scripts/deploy_gcp.sh
```

**Pros:**
- ✅ Full control
- ✅ Can test locally first
- ✅ Works offline

**Cons:**
- ❌ Have to remember to deploy
- ❌ Takes your time
- ❌ Can forget steps

### Automatic Deployment (with GitHub Actions)

```bash
git push origin main
```

**Pros:**
- ✅ Always consistent
- ✅ Fully automated
- ✅ Runs in background
- ✅ Team-friendly
- ✅ Deployment history
- ✅ Can rollback easily

**Cons:**
- ❌ Uses GitHub Actions minutes (free tier: 2000/month)
- ❌ Need to set up secrets once

---

## 🎓 Key Concepts

### Image Tags

Every deployment creates two tags:
```
backend:latest           ← Always newest
backend:abc123def        ← Specific commit SHA

frontend:latest          ← Always newest
frontend:abc123def       ← Specific commit SHA
```

### Rollback

If deployment breaks something:

```bash
# Find previous working commit
git log

# Deploy specific version
gcloud run deploy nulleffect-backend \
    --image=us-central1-docker.pkg.dev/nulleffect-qa/nulleffect-docker/backend:abc123def \
    --region=us-central1

# Or just revert and push
git revert HEAD
git push origin main
# → Auto-deploys previous version
```

### Environments

Current setup:
- One environment: `production`
- Deploys directly to `nulleffect-qa`

Future enhancement:
- Add `staging` environment
- Test there first
- Manual approval for production

---

## 💰 Cost Impact

### GitHub Actions (Free Tier)
- Public repo: 2,000 minutes/month
- Private repo: 3,000 minutes/month
- This workflow: ~6 minutes/run
- **You can run ~500 deployments/month for free!**

### Google Cloud
- Cloud Build: First 120 build-minutes/day free
- Cloud Run: Free tier covers most small projects
- Artifact Registry: Free for first 0.5GB

**Total cost for small project: ~$0-5/month**

---

## 🔒 Security

### What's Protected
✅ Service account key in GitHub Secrets (encrypted)
✅ Minimum permissions granted
✅ Keys never exposed in logs
✅ No credentials in code

### Best Practices
- ✅ Use service accounts (not personal credentials)
- ✅ Grant only necessary permissions
- ✅ Rotate keys regularly (every 90 days)
- ✅ Use branch protection rules
- ✅ Require PR reviews for main

---

## 🆘 Troubleshooting

### "Permission denied"
→ Service account needs more roles
→ Run: `./scripts/setup_github_actions.sh`

### "Image not found"
→ Artifact Registry doesn't exist
→ Run Terraform first: `cd terraform && terraform apply`

### "Authentication failed"
→ `GOOGLE_CREDENTIALS` secret not set
→ Check GitHub Settings → Secrets

### "Backend URL not set"
→ Backend deployment failed
→ Check workflow logs in GitHub Actions

### "Tests failed"
→ Service deployed but not responding
→ Check Cloud Run logs: `./scripts/view_logs.sh both`

---

## 📚 Additional Resources

- **Workflow file:** `.github/workflows/deploy.yml`
- **Full documentation:** `.github/workflows/README.md`
- **Setup script:** `scripts/setup_github_actions.sh`
- **GitHub Actions docs:** https://docs.github.com/en/actions

---

## ✅ Summary

**Before:**
```
Make changes → Run ./scripts/deploy_gcp.sh → Wait 5 min → Test
```

**After setup:**
```
Make changes → git push → ☕ → Get notification → It's live! ✨
```

**Setup required:**
1. Run `./scripts/setup_github_actions.sh`
2. Add `GOOGLE_CREDENTIALS` to GitHub Secrets
3. Push to main
4. Done! 🎉

---

**Ready to set it up?**

```bash
cd /Users/stephenleonard/git/nulleffect/nulleffect
./scripts/setup_github_actions.sh
```

Then follow the instructions it prints!
