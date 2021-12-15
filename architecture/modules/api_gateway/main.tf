resource "google_api_gateway_api" "api" {
  provider = google-beta
  api_id = "api"
  display_name = "elpis-api"
}

resource "google_api_gateway_api_config" "api_cfg" {
  provider = google-beta
  api = google_api_gateway_api.api.api_id
  api_config_id = "elpis-api-cfg"

  openapi_documents {
    document {
      path = "spec.yaml"
      contents = filebase64(templatefile(var.swagger_location, { hello_url = var.function_url }))
    }
  }
  lifecycle {
    create_before_destroy = true
  }
}

resource "google_api_gateway_gateway" "gateway" {
  provider   = google-beta
  api_config = google_api_gateway_api_config.api_cfg.id
  gateway_id = "elpis-api-gateway"
  region     = var.region
}

# Load balancer for api gateway
