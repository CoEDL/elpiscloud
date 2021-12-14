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
    method          = ["GET"]
    response_header = ["*"]
    max_age_seconds = 3600
  }
}

resource "google_storage_bucket_iam_binding" "sa" {
  bucket  = google_storage_bucket.static-site.name
  role    = "roles/storage.admin"
  members = [
    "serviceAccount:${var.project_number}@cloudbuild.gserviceaccount.com",
  ]
}

resource "google_storage_bucket_iam_binding" "public" {
  bucket  = google_storage_bucket.static-site.name
  role    = "roles/storage.objectViewer"
  members = [
    "allUsers",
  ]
}

resource "google_compute_backend_bucket" "backend" {
  name        = "site-bucket-backend"
  description = "Backend for site bucket"
  bucket_name = google_storage_bucket.static-site.name
  enable_cdn  = true
}

// Static IP for load balancer
resource "google_compute_global_address" "lb_ip" {
  name = "elb-ip"
}

resource "google_compute_url_map" "urlmap" {
  name        = "urlmap"
  description = "Maps urls to the bucket."

  default_service = google_compute_backend_bucket.backend.id

  host_rule {
    hosts        = ["${var.name}"]
    path_matcher = "mysite"
  }

  path_matcher {
    name            = "mysite"
    default_service = google_compute_backend_bucket.backend.id
  }
}

resource "google_compute_target_http_proxy" "default" {
  project     = var.project
  provider    = google-beta
  name        = "target-proxy"
  description = "Proxy for site bucket forwarding rules"
  url_map     = google_compute_url_map.urlmap.self_link
}

// HTTP Forwarding rule
resource "google_compute_global_forwarding_rule" "default" {
  provider              = google-beta
  name                  = "frontend-80"
  project               = var.project
  ip_address            = google_compute_global_address.lb_ip.address
  target                = google_compute_target_http_proxy.default.self_link
  port_range            = 80
}