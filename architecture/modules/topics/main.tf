resource "google_pubsub_topic" "dataset_processing_topic" {
  name = "dataset-processing-topic"

  labels = {
    stage = "processing"
  }
}

resource "google_pubsub_topic" "model_processing_topic" {
  name = "model-processing-topic"

  labels = {
    stage = "training"
  }
}
