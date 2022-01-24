variable "name" {}
variable "location" {}
variable "env" {}

variable "project" {}
variable "project_number" {}

variable "region" {
    type = string
    default = "us-central1"
}

variable "root_zone" {}
variable "ssl_cert" {}
