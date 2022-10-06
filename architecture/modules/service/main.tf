resource "google_cloud_run_service" "default" {
  name     = var.service_name
  location = var.location
  template {
    spec {
      containers {
        image = var.image
        env {
          name  = "DATASET_BUCKET"
          value = var.user_datasets_bucket.name
        }
        env {
          name  = "MODEL_BUCKET"
          value = var.trained_models_bucket.name
        }
      }
    }
  }

  traffic {
    percent         = 100
    latest_revision = true
  }

}

resource "google_cloud_run_service_iam_binding" "binding" {
  location = google_cloud_run_service.default.location
  service  = google_cloud_run_service.default.name
  role     = "roles/run.invoker"
  members  = ["serviceAccount:${var.elpis_worker.email}"]
}

resource "google_project_iam_binding" "project" {
  project = var.project
  role    = "roles/iam.serviceAccountTokenCreator"
  members = ["serviceAccount:${var.elpis_worker.email}"]
}

resource "google_pubsub_subscription" "subscription" {
  name  = "${var.service_name}_subscription"
  topic = var.topic.name
  push_config {
    push_endpoint = google_cloud_run_service.default.status[0].url
    oidc_token {
      service_account_email = var.elpis_worker.email
    }
    attributes = {
      x-goog-version = "v1"
    }
  }
}
