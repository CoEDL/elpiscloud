locals {
  env = "prod"
  website_url = "elpis.cloud"
}

provider "google" {
  project = "${var.project}"
}

module "frontend_bucket" {
  source   = "../../modules/frontend_bucket"
  name     = "${local.website_url}"
  location = "US"
  env      = "${local.env}"
  project  = "${var.project}"
}