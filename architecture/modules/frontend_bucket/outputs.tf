output "static-site-bucket" {
  value = "${google_storage_bucket.static-site.name}"
}