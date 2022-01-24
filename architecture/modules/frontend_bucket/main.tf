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
  enable_cdn  = false
}

// Static IP for load balancer
resource "google_compute_global_address" "lb_ip" {
  name = "elb-ip"
}

resource "google_compute_url_map" "urlmap" {
  name        = "urlmap"
  description = "Maps urls to the bucket."

  default_service = google_compute_backend_bucket.backend.id
}

resource "google_compute_target_https_proxy" "frontend_proxy_443" {
  name             = "frontend-https-proxy"
  ssl_certificates = [var.ssl_cert.id]
  url_map          = google_compute_url_map.urlmap.self_link
}

// HTTPS
resource "google_compute_global_forwarding_rule" "frontend_fwd_rule_443" {
  name        = "frontend-443"
  target      = google_compute_target_https_proxy.frontend_proxy_443.id
  ip_protocol = "TCP"
  port_range  = "443"
  ip_address  = google_compute_global_address.lb_ip.address
}

resource "google_dns_record_set" "api" {
  managed_zone = var.root_zone.name
  name         = var.root_zone.dns_name
  rrdatas      = [google_compute_global_address.lb_ip.address]
  ttl          = 300
  type         = "A"
}