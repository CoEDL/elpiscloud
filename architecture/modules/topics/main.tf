resource "google_pubsub_topic" "dataset_processing_topic" {
  name = "dataset_processing_topic"

  labels = {
    stage = "processing"
  }
}