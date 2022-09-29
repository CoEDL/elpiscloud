output "dataset_processing_topic" {
  value = google_pubsub_topic.dataset_processing_topic
}

output "model_processing_topic" {
  value = google_pubsub_topic.model_processing_topic
}
