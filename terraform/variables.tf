
variable "project_id" { type = string description = "GCP Project ID" default = "nulleffect-qa" }
variable "region"     { type = string description = "GCP Region (e.g. us-central1)" default = "us-central1" }
variable "repo_id"    { type = string description = "Artifact Registry repository id" default = "nulleffect-docker" }
variable "backend_image"  { type = string description = "Full image name for backend"  default = "us-central1-docker.pkg.dev/PROJECT/nulleffect-docker/backend:latest" }
variable "frontend_image" { type = string description = "Full image name for frontend" default = "us-central1-docker.pkg.dev/PROJECT/nulleffect-docker/frontend:latest" }
