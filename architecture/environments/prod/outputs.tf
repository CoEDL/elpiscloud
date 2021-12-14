output "site_ip" {
  value = "${module.frontend_bucket.ip}"
}

output "site_bucket" {
  value = "${module.frontend_bucket.bucket}"
}
