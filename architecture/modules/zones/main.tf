resource "google_dns_managed_zone" "root_zone" {
  name     = var.root_zone_name
  dns_name = "${var.root_zone_url}."
}

resource "google_compute_managed_ssl_certificate" "ssl_cert" {
  name = "ssl-cert"

  managed {
    domains = ["${var.root_zone_url}.com", "api.${var.root_zone_url}.com"]
  }

  lifecycle {
    create_before_destroy = true
  }
}


