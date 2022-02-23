resource "google_storage_bucket" "bucket" {
  name          = "${var.file_type}-files"
  location      = "${var.location}"
  force_destroy = true

  uniform_bucket_level_access = true
}

resource "google_storage_bucket_iam_binding" "sa" {
  bucket  = google_storage_bucket.bucket.name
  role    = "roles/storage.admin"
  members = [
    "serviceAccount:${var.elpis_worker.email}",
  ]
}