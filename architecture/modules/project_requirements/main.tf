# Enable services
resource "google_project_service" "run" {
  service = "run.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "iam" {
  service = "iam.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudbuild" {
  service = "cloudbuild.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "cloudfunctions" {
  service = "cloudfunctions.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "enable_cloud_resource_manager_api" {
  service            = "cloudresourcemanager.googleapis.com"
  disable_on_destroy = false
}

# Create a service account
resource "google_service_account" "elpis_worker" {
  account_id   = "elpis-worker"
  display_name = "Elpis Worker SA"
  
  depends_on = [google_project_service.iam]
}

# Set permissions
resource "google_project_iam_binding" "service_permissions" {
  for_each = toset([
    "run.invoker", "cloudfunctions.invoker"
  ])
  
  project    = var.project
  role       = "roles/${each.key}"
  members    = ["serviceAccount:${google_service_account.elpis_worker.email}"]
  depends_on = [google_service_account.elpis_worker]
}