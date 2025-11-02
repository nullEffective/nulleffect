
output "artifact_registry_repo" { value = google_artifact_registry_repository.docker_repo.repository_id }
output "frontend_service" { value = google_cloud_run_v2_service.frontend.name }
output "backend_service"  { value = google_cloud_run_v2_service.backend.name }
