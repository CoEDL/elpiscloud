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

// HTTP redirect to HTTPS
// From https://stackoverflow.com/a/66256756

// URL Map that simply changes the redirected request from HTTP to HTTPS
resource "google_compute_url_map" "http_redirect" {
  name = "http-redirect"

  default_url_redirect {
    redirect_response_code = "MOVED_PERMANENTLY_DEFAULT"  // 301 redirect
    strip_query            = false
    https_redirect         = true  // Specifies the URL scheme in the redirected request to be set to HTTPS
  }
}

// A proxy that routes incoming requests to the "http-redirect" URL Map
resource "google_compute_target_http_proxy" "http_redirect" {
  name    = "frontend-http-redirect"
  url_map = google_compute_url_map.http_redirect.self_link
}

// Creates a forwarding rule for requests to the given ip address 
// at port 80 using TCP
resource "google_compute_global_forwarding_rule" "http_redirect" {
  name       = "frontend-http-redirect"
  target     = google_compute_target_http_proxy.http_redirect.self_link
  ip_address = google_compute_global_address.lb_ip.address
  port_range = "80"
  ip_protocol = "TCP"
}

// Creates a Record Set with the given IP address associated with the dns_name in
// the Google Cloud DNS
resource "google_dns_record_set" "api" {
  managed_zone = var.root_zone.name
  name         = var.root_zone.dns_name
  rrdatas      = [google_compute_global_address.lb_ip.address]
  ttl          = 300
  type         = "A"
}