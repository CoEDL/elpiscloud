output "url" {
    value = google_api_gateway_gateway.gateway.default_hostname
}

output "lb_ip" {
    value = google_compute_global_address.lb_ip.address
}