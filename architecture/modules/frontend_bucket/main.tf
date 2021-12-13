resource "google_storage_bucket" "static-site" {
  name          = "${var.project}-${var.env}-site"
  location      = "${var.location}"
  force_destroy = true

  uniform_bucket_level_access = true

  website {
    main_page_suffix = "index.html"
    not_found_page   = "404.html"
  }
  cors {
    origin          = ["http://${var.name}"]
    method          = ["GET, POST"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}