output "function_url_map" {
    value = {
      "hello_url"      = google_cloudfunctions_function.health_check.https_trigger_url
      "sign_files_url" = google_cloudfunctions_function.sign_files.https_trigger_url
    }
}