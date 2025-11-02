
# NullEffect — FastAPI + React on Google Cloud Run

Starter with FastAPI backend + React (Vite) frontend, Terraform for Cloud Run/Artifact Registry,
and GitHub Actions for deploys on commit. Defaults to **project_id nulleffect-qa**.

## Layout
```
backend/ (FastAPI, /ping)
frontend/ (Vite React)
terraform/ (Artifact Registry + Cloud Run services)
.github/workflows/ (CI/CD)
scripts/ (local + deploy helpers)
```
