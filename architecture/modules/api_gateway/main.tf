resource "google_api_gateway_api" "api" {
  provider     = google-beta
  project      = var.project
  api_id       = "api"
  display_name = "elpis-api"
}

resource "google_api_gateway_api_config" "api_cfg" {
  provider             = google-beta
  project              = var.project
  api                  = google_api_gateway_api.api.api_id
  api_config_id_prefix = "elpis-api-cfg"

  openapi_documents {
    document {
      path = "spec.yaml"
      contents = base64encode(
      templatefile(var.swagger_location, var.function_url_map))
    }
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "google_api_gateway_gateway" "gateway" {
  provider   = google-beta
  project    = var.project
  api_config = google_api_gateway_api_config.api_cfg.id
  gateway_id = "elpis-api-gateway"
  region     = var.region
}

# ----- Load balancer for api gateway (TODO Refactor later) ------
resource "google_compute_global_network_endpoint_group" "api_neg" {
  name                  = "elpis-apigw-neg"
  network_endpoint_type = "INTERNET_FQDN_PORT"
}

resource "google_compute_global_network_endpoint" "api_endpoint" {
  global_network_endpoint_group = google_compute_global_network_endpoint_group.api_neg.id
  port                          = 443
  fqdn                          = google_api_gateway_gateway.gateway.default_hostname
}

resource "google_compute_backend_service" "api_lb_backend" {
  provider   = google-beta
  project    = var.project
  name       = "apigw-lb-backend"
  enable_cdn = true
  protocol   = "HTTPS"
  custom_request_headers = [
    "Host: ${google_compute_global_network_endpoint.api_endpoint.fqdn}",
    "Access-Control-Origin: *",
  ]

  backend {
    group = google_compute_global_network_endpoint_group.api_neg.id
  }
}

resource "google_compute_url_map" "api_url_map" {
  name            = "apigw-url-map"
  default_service = google_compute_backend_service.api_lb_backend.id
}

resource "google_compute_target_https_proxy" "api_target_proxy" {
  name             = "apigw-target-proxy"
  ssl_certificates = [var.ssl_cert.id]
  url_map          = google_compute_url_map.api_url_map.id
}

resource "google_compute_global_address" "api_fwd_address" {
  name = "apigw-fwd-rule-address"
}

resource "google_compute_global_forwarding_rule" "api_fwd_rule" {
  name        = "apigw-fwd-rule"
  target      = google_compute_target_https_proxy.api_target_proxy.id
  ip_protocol = "TCP"
  port_range  = "443"
  ip_address  = google_compute_global_address.api_fwd_address.address
}

resource "google_dns_record_set" "api" {
  managed_zone = var.root_zone.name
  name         = "api.${var.root_zone.dns_name}"
  rrdatas      = [google_compute_global_address.api_fwd_address.address]
  ttl          = 300
  type         = "A"
}