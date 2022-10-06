terraform {
  backend "gcs" {
    bucket = "elpiscloud-tfstate"
    prefix = "env/prod"
  }
}
