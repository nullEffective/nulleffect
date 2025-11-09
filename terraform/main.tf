terraform {
  required_version = ">= 1.7.0"
  required_providers {
    google = { source = "hashicorp/google", version = ">= 5.34.0" }
  }
}
provider "google" {
  project = var.project_id
  region  = var.region
}
resource "google_artifact_registry_repository" "docker_repo" {
  location      = var.region
  repository_id = var.repo_id
  description   = "Docker repo for NullEffect images"
  format        = "DOCKER"
}
resource "google_cloud_run_v2_service" "backend" {
  name     = "nulleffect-backend"
  location = var.region
  template {
    containers {
      image = var.backend_image
      ports { container_port = 8080 }
    }
    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }
  }
  ingress = "INGRESS_TRAFFIC_ALL"
}
resource "google_cloud_run_v2_service_iam_member" "backend_invoker" {
  location = var.region
  name     = google_cloud_run_v2_service.backend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
resource "google_cloud_run_v2_service" "frontend" {
  name     = "nulleffect-frontend"
  location = var.region
  template {
    containers {
      image = var.frontend_image
      ports {
        container_port = 8080
      }
    }
    scaling {
      min_instance_count = 0
      max_instance_count = 3
    }
  }
  ingress = "INGRESS_TRAFFIC_ALL"
}
resource "google_cloud_run_v2_service_iam_member" "frontend_invoker" {
  location = var.region
  name     = google_cloud_run_v2_service.frontend.name
  role     = "roles/run.invoker"
  member   = "allUsers"
}
