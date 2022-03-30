resource "google_pubsub_topic" "dataset_processing_topic" {
  name = "dataset-processing-topic"

  labels = {
    stage = "processing"
  }

  message_retention_duration = "86600s"
}