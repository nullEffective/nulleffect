# NullEffect — FastAPI + React on Google Cloud Run

Full-stack starter template with FastAPI backend, React (Vite) frontend, and Google Cloud Platform deployment.
Includes Terraform infrastructure-as-code and GitHub Actions CI/CD.

**Default GCP project:** `nulleffect-qa`

## 🚀 Quick Start

```bash
# Make scripts executable
cd scripts && ./make_executable.sh && cd ..

# Deploy to Google Cloud
./scripts/deploy_gcp.sh

# Check deployment status
./scripts/check_status.command
```

## 📁 Project Structure

```
nulleffect/
├── backend/              # FastAPI backend
│   ├── app/
│   │   └── main.py      # API endpoints (/ping)
│   └── Dockerfile
├── frontend/            # React + Vite frontend
│   ├── src/
│   │   └── App.jsx     # Main app component
│   ├── Dockerfile      # Multi-stage build with Nginx
│   ├── cloudbuild.yaml # Cloud Build configuration
│   └── package.json
├── terraform/           # Infrastructure as code
│   ├── main.tf         # Artifact Registry + Cloud Run
│   ├── variables.tf
│   └── outputs.tf
├── scripts/            # Deployment & management scripts
│   ├── deploy_gcp.sh           # Main deployment
│   ├── check_status.command    # Check services
│   ├── view_logs.sh           # View logs
│   ├── test_services.sh       # Test endpoints
│   └── README.md              # Full scripts documentation
├── .github/workflows/  # CI/CD
│   ├── terraform-apply.yml    # Auto-deploy on push
│   └── terraform-pr.yml       # PR checks
└── DEPLOYMENT_FIX_README.md  # Deployment guide
```

## 🛠️ Available Scripts

See [`scripts/README.md`](scripts/README.md) for full documentation.

### Essential Scripts

| Script | Description | Usage |
|--------|-------------|-------|
| `deploy_gcp.sh` | Deploy to Cloud Run | `./scripts/deploy_gcp.sh` |
| `check_status.command` | Check deployment status | `./scripts/check_status.command` |
| `view_logs.sh` | View service logs | `./scripts/view_logs.sh both` |
| `test_services.sh` | Test endpoints | `./scripts/test_services.sh` |

### Management Scripts

| Script | Description |
|--------|-------------|
| `delete_services.sh` | Delete deployed services |
| `update_env.sh` | Update environment variables |
| `print_status.sh` | Print service URLs |

### Setup Scripts

| Script | Description |
|--------|-------------|
| `make_executable.sh` | Make all scripts executable |
| `setup_local.sh` | Setup local development |
| `build_local.sh` | Build Docker images locally |

## 🌐 Architecture

```
User
  ↓
nulleffect.com (your domain)
  ↓
Cloud Run: Frontend (React + Vite + Nginx)
  ↓ fetch(backend_url/ping)
Cloud Run: Backend (FastAPI)
  ↓
Returns: {"response": "2025-11-10T..."}
```

## 📦 Deployment

### Automated (GitHub Actions)
Push to `main` branch automatically triggers deployment via `.github/workflows/terraform-apply.yml`

### Manual Deployment
```bash
# Deploy everything
./scripts/deploy_gcp.sh

# Or deploy with custom settings
./scripts/deploy_gcp.sh my-project-id us-west1 my-docker-repo
```

### What Happens During Deployment

1. **Backend Build** → Docker image pushed to Artifact Registry
2. **Backend Deploy** → Cloud Run service created
3. **Get Backend URL** → Captures the service URL
4. **Frontend Build** → Docker image with backend URL baked in
5. **Frontend Deploy** → Cloud Run service created
6. **Test** → Hits `/ping` endpoint to verify

## 🔧 Local Development

### Backend
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8080
```

Test: http://localhost:8080/ping

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Test: http://localhost:5173

**Note:** Frontend expects backend at `http://localhost:8080` in dev mode.

## 📊 Monitoring

### Check Status
```bash
./scripts/check_status.command
```

### View Logs
```bash
# Both services
./scripts/view_logs.sh both

# Backend only
./scripts/view_logs.sh backend 100

# Frontend only
./scripts/view_logs.sh frontend
```

### Test Endpoints
```bash
./scripts/test_services.sh
```

## 🌍 Custom Domain Setup

### Option 1: DNS CNAME
Point your domain to the frontend Cloud Run URL:
```
CNAME @ → nulleffect-frontend-xxxxx-uc.a.run.app
```

### Option 2: Cloud Run Domain Mapping
```bash
gcloud run domain-mappings create \
    --service=nulleffect-frontend \
    --domain=nulleffect.com \
    --region=us-central1
```

Follow the instructions to add DNS records. Benefits:
- Automatic SSL certificate
- Better performance
- Direct Cloud Run integration

## 🔐 Environment Variables

### Backend
Set via Cloud Run:
```bash
./scripts/update_env.sh nulleffect-qa us-central1 backend \
    LOG_LEVEL=debug \
    DATABASE_URL=postgres://...
```

### Frontend
Set at build time via `VITE_API_BASE`:
- Automatically set during deployment (backend URL)
- For local dev: defaults to `http://localhost:8080`

## 🧪 Testing

### Manual Testing
```bash
# Get service URLs
./scripts/print_status.sh

# Test backend
curl https://nulleffect-backend-xxxxx.run.app/ping

# Test frontend (in browser)
open https://nulleffect-frontend-xxxxx.run.app
```

### Automated Testing
```bash
./scripts/test_services.sh
```

## 📚 Documentation

- **[Deployment Guide](DEPLOYMENT_FIX_README.md)** - Complete deployment documentation
- **[Scripts README](scripts/README.md)** - All available scripts
- **[Terraform Docs](terraform/)** - Infrastructure configuration

## 🚨 Troubleshooting

### Frontend shows "Failed to fetch"
1. Check backend is deployed: `./scripts/check_status.command`
2. Check backend is responding: `curl $BACKEND_URL/ping`
3. Verify frontend was built with correct backend URL
4. View logs: `./scripts/view_logs.sh both`

### Services not deploying
1. Check GCP permissions
2. Verify Cloud Build is enabled
3. Check quotas: `gcloud compute project-info describe --project=nulleffect-qa`
4. View build logs in GCP Console

### Permission errors
```bash
./scripts/make_executable.sh
```

## 🛡️ Security Notes

- Both services allow unauthenticated access (`--allow-unauthenticated`)
- CORS is enabled for all origins in backend (`allow_origins=["*"]`)
- For production, consider:
  - Authentication (Firebase Auth, Auth0, etc.)
  - Restricted CORS origins
  - Cloud Armor for DDoS protection
  - Secret Manager for sensitive data

## 💰 Cost Optimization

Cloud Run pricing:
- Free tier: 2 million requests/month
- Pay only when services are running
- `min_instances=0` for cost savings (cold starts)
- Scale to zero when idle

## 🔄 CI/CD

GitHub Actions automatically:
1. Validates Terraform on PRs
2. Deploys to Cloud Run on push to `main`
3. Uses service account key from secrets

Required secrets:
- `GOOGLE_CREDENTIALS` - Service account JSON key
- `PROJECT_ID` - GCP project ID (optional, defaults to nulleffect-qa)

## 🤝 Contributing

1. Create a feature branch
2. Make changes
3. Test locally
4. Submit PR (Terraform validation runs automatically)
5. Merge to `main` (auto-deploys)

## 📄 License

MIT

## 🆘 Support

- View logs: `./scripts/view_logs.sh both 100`
- Check status: `./scripts/check_status.command`
- Full guide: [DEPLOYMENT_FIX_README.md](DEPLOYMENT_FIX_README.md)
- Scripts help: [scripts/README.md](scripts/README.md)

---

**Built with ❤️ for rapid full-stack deployment on GCP**
