variable "region" {
    type = string
    default = "us-central1"
}
variable "location" {}
variable "project" {}
variable "functions_folder" {}
variable "elpis_worker" {}
variable "user_upload_files_bucket" {}
variable "user_datasets_bucket" {}

variable "dataset_processing_topic" {}