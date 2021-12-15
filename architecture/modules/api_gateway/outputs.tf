output "url" {
    value = google_api_gateway_gateway.gateway.default_hostname
}

output "ip" {
    value = google_compute_global_address.api_ip.address
}