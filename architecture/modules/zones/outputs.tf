output "root_zone" {
  value = google_dns_managed_zone.root_zone
}

output "ssl_cert" {
  value = google_compute_managed_ssl_certificate.ssl_cert
}