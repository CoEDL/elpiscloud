output "bucket" {
  value = google_storage_bucket.static_site.name
}

output "ip" {
  value = google_compute_global_address.lb_ip.address
}