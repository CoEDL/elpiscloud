locals {
  env              = "prod"
  website_url      = "elpis.cloud"
  functions_folder = "../../../api/functions"
}

provider "google" {
  project = "${var.project}"
}

module "requirements" {
  source  = "../../modules/project_requirements"
  project = "${var.project}"
}

module "functions" {
  source           = "../../modules/functions"
  project          = "${var.project}"
  functions_folder = local.functions_folder
  elpis_worker     = module.requirements.elpis_worker

  depends_on       = [module.requirements]
}

module "frontend_bucket" {
  source         = "../../modules/frontend_bucket"
  name           = "${local.website_url}"
  location       = "US"
  env            = "${local.env}"
  project        = "${var.project}"
  project_number = "${var.project_number}"
}