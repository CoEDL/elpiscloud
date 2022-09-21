locals {
  env              = "prod"
  website_url      = "elpis.cloud"
  functions_folder = "../../../functions"
  swagger_api      = "../../../swagger_api.yaml"
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

# Documentation
resource "google_dns_record_set" "documentation" {
  name         = "docs.${module.zones.root_zone.dns_name}"
  managed_zone = module.zones.root_zone.name
  type         = "CNAME"
  ttl          = 300
  rrdatas      = ["elpiscloud.readthedocs.io."]
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

module "user_datasets_bucket" {
  source           = "../../modules/user_files_bucket"
  location         = local.location
  file_type        = "user-dataset"
  elpis_worker     = module.requirements.elpis_worker

  depends_on       = [module.requirements]
}

module "trained_models_bucket" {
  source           = "../../modules/user_files_bucket"
  location         = local.location
  file_type        = "trained-model"
  elpis_worker     = module.requirements.elpis_worker

  depends_on       = [module.requirements]
}

module "topics" {
  source = "../../modules/topics"
}

module "functions" {
  source                    = "../../modules/functions"
  project                   = var.project
  location                  = local.location
  functions_folder          = local.functions_folder
  elpis_worker              = module.requirements.elpis_worker
  user_upload_files_bucket  = module.user_upload_files_bucket.bucket
  user_datasets_bucket      = module.user_datasets_bucket.bucket
  dataset_processing_topic  = module.topics.dataset_processing_topic
  model_processing_topic    = module.topics.model_processing_topic

  depends_on = [
    module.requirements,
    module.topics,
    module.user_upload_files_bucket
  ]
}

module "api_gateway" {
  source           = "../../modules/api_gateway"
  project          = var.project
  host             = "api.${local.website_url}"
  swagger_location = local.swagger_api
  function_url_map     = module.functions.function_url_map

  root_zone            = module.zones.root_zone
  ssl_cert             = module.zones.ssl_cert
  depends_on           = [module.zones]
}

# ===== Trainer Service ===== 
resource "google_eventarc_trigger" "trainer_trigger" {
    name = "trainer_trigger"
    location = local.location
    matching_criteria {
        attribute = "type"
        value = "google.cloud.pubsub.topic.v1.messagePublished"
    }
    destination {
        cloud_run_service {
            service = google_cloud_run_service.trainer.name
            region = local.location
        }
    }
    pubsub {
        topic = modules.topics.model_processing_topic.name
    }
}

resource "google_cloud_run_service" "trainer" {
    name     = "eventarc-service"
    location = local.location

    metadata {
        namespace = var.project
    }

    template {
        spec {
            containers {
                image = "gcr.io/elpiscloud/trainer"
                ports {
                    container_port = 8080
                }
            }
            container_concurrency = 1
            #timeout_seconds = 600
        }
    }

    traffic {
        percent         = 100
        latest_revision = true
    }
}
# End Trainer Service

