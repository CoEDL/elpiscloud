resource "google_api_gateway_api" "api" {
  provider     = google-beta
  project      = var.project
  api_id       = "api"
  display_name = "elpis-api"
}

resource "google_api_gateway_api_config" "api_cfg" {
  provider      = google-beta
  project       = var.project
  api           = google_api_gateway_api.api.api_id
  api_config_id = "elpis-api-cfg"

  openapi_documents {
    document {
      path = "spec.yaml"
      contents = base64encode(templatefile(var.swagger_location, { hello_url = var.function_url }))
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
# Static ip
resource "google_compute_global_address" "api_ip" {
  name = "api-gateway-ip"
}

resource "google_compute_url_map" "api_urlmap" {
  name        = "api-gateway-urlmap"
  description = "Maps urls to the gateway."

  default_service = google_compute_backend_service.api_backend_service.id

  host_rule {
    hosts        = [var.host]
    path_matcher = "mysite"
  }

  path_matcher {
    name            = "mysite"
    default_service = google_compute_backend_service.api_backend_service.id
  }
}

# Backend service
resource "google_compute_backend_service" "api_backend_service" {
  name        = "api-gateway-backend-service"
  port_name   = "http"
  protocol    = "HTTP"
  timeout_sec = 10

  health_checks = [google_compute_http_health_check.api_hc.id]
}

resource "google_compute_http_health_check" "api_hc" {
  name               = "api-gateway-health-check"
  request_path       = "/"
  check_interval_sec = 1
  timeout_sec        = 1
}

resource "google_compute_target_http_proxy" "api_proxy" {
  project     = var.project
  provider    = google-beta
  name        = "api-gateway-target-proxy"
  description = "Proxy for site bucket forwarding rules"
  url_map     = google_compute_url_map.api_urlmap.self_link
}

// HTTP Forwarding rule
resource "google_compute_global_forwarding_rule" "api_fwd_80" {
  provider              = google-beta
  name                  = "api-80"
  project               = var.project
  ip_address            = google_compute_global_address.api_ip.address
  target                = google_compute_target_http_proxy.api_proxy.self_link
  port_range            = 80
}