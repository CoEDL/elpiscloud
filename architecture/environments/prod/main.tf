locals {
  env              = "prod"
  website_url      = "elpis.cloud"
  functions_folder = "../../../api/functions"
  swagger_api      = "../../../api/swagger_api.yaml"
  location         = "US"
}

provider "google" {
  project = var.project
}

module "requirements" {
  source  = "../../modules/project_requirements"
  project = var.project
}

module "zones" {
  source         = "../../modules/zones"
  root_zone_name = "root-zone" 
  root_zone_url  = local.website_url
}

module "frontend_bucket" {
  source           = "../../modules/frontend_bucket"
  project          = var.project
  project_number   = var.project_number
  location         = local.location
  env              = local.env
  name             = local.website_url
  root_zone        = module.zones.root_zone
  ssl_cert         = module.zones.ssl_cert

  depends_on       = [module.zones]
}

module "user_upload_files_bucket" {
  source           = "../../modules/user_files_bucket"
  location         = local.location
  file_type        = "user-upload"
  elpis_worker     = module.requirements.elpis_worker

  depends_on       = [module.requirements]
}

module "functions" {
  source           = "../../modules/functions"
  project          = var.project
  location         = local.location
  functions_folder = local.functions_folder
  elpis_worker     = module.requirements.elpis_worker
  depends_on       = [module.requirements]
}

module "api_gateway" {
  source           = "../../modules/api_gateway"
  project          = var.project
  host             = "api.${local.website_url}"
  swagger_location = local.swagger_api
  function_url_map     = module.functions.function_urls

  root_zone            = module.zones.root_zone
  ssl_cert             = module.zones.ssl_cert
  depends_on           = [module.zones]
}