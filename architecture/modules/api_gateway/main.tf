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

# Load balancer for api gateway
