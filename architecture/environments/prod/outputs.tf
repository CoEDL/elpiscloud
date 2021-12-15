output "site_ip" {
  value = "${module.frontend_bucket.ip}"
}

output "site_bucket" {
  value = "${module.frontend_bucket.bucket}"
}

output "api_url" {
  value = module.api_gateway.url
}

output "api_ip" {
  value = module.api_gateway.ip
}