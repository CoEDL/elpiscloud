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
      contents = filebase64(data.template_file.elpis_api_swagger.rendered)
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

# Replace endpoint urls with cloudfunction endpoints we've created.
data "template_file" "elpis_api_swagger" {
  template = "${file(var.swagger_location)}"

  vars {
    hello_url = "${var.function_url}"
  }
}

# Load balancer for api gateway
