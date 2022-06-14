resource "google_cloudfunctions_function" "function" {
  name        = "hello"
  description = "test function"
  runtime     = "python37"
  region      = var.region

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.source.name
  source_archive_object = google_storage_bucket_object.archive.name
  trigger_http          = true
  entry_point           = "hello"
  service_account_email = var.elpis_worker.email
}

resource "google_cloudfunctions_function" "sign_files" {
  name        = "sign-files"
  description = "Signs files to be uploaded to the relevant storage bucket"
  runtime     = "python37"
  region      = var.region

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.source.name
  source_archive_object = google_storage_bucket_object.archive.name
  trigger_http          = true
  entry_point           = "sign_files"
  service_account_email = var.elpis_worker.email
}

resource "google_cloudfunctions_function" "storage_watcher" {
  name        = "storage-watcher"
  description = "Updates user file info in firestore from cloud storage events"
  runtime     = "python37"
  region      = var.region

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.source.name
  source_archive_object = google_storage_bucket_object.archive.name
  entry_point           = "storage_watcher"
  event_trigger {
    event_type = "google.storage.object.finalize"
    resource   = var.user_upload_files_bucket.name
  }
  service_account_email = var.elpis_worker.email
}

resource "google_cloudfunctions_function" "process_dataset" {
  name        = "process-dataset"
  description = "Process new datasets for training"
  runtime     = "python37"
  region      = var.region

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.source.name
  source_archive_object = google_storage_bucket_object.archive.name
  entry_point           = "process_dataset"
  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.create"
    resource   = "projects/elpiscloud/databases/(default)/documents/users/{userId}/datasets/{dataset}"
  }

  environment_variables = {
    TOPIC_ID = var.dataset_processing_topic.id
    PROJECT = var.project
  }

  service_account_email = var.elpis_worker.email
}

resource "google_cloudfunctions_function" "process_dataset_file" {
  name        = "process-dataset-file"
  description = "Process a file in a new dataset"
  runtime     = "python37"
  region      = var.region

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.source.name
  source_archive_object = google_storage_bucket_object.archive.name
  entry_point           = "process_dataset_file"
  event_trigger {
    event_type = "google.pubsub.topic.publish"
    resource   = var.dataset_processing_topic.name
  }

  environment_variables = {
    USER_FILES_BUCKET = var.user_upload_files_bucket.name
    USER_DATASETS_BUCKET = var.user_datasets_bucket.name
  }

  service_account_email = var.elpis_worker.email
}

resource "google_cloudfunctions_function" "delete_dataset_from_bucket" {
  name        = "delete-dataset-from-bucket"
  description = "Deletes a dataset from GCP when a dataset is deleted from Firestore"
  runtime     = "python37"
  region      = var.region

  available_memory_mb   = 128
  source_archive_bucket = google_storage_bucket.source.name
  source_archive_object = google_storage_bucket_object.archive.name
  entry_point           = "delete_dataset_from_bucket"
  event_trigger {
    event_type = "providers/cloud.firestore/eventTypes/document.delete"
    resource   = "projects/elpiscloud/databases/(default)/documents/users/{userId}/datasets/{dataset}"
  }

  environment_variables = {
    USER_DATASETS_BUCKET = var.user_datasets_bucket.name
  }

  service_account_email = var.elpis_worker.email
}


# A dedicated Cloud Storage bucket to store the zip source
resource "google_storage_bucket" "source" {
  name     = "${var.project}-functions-source"
  location = var.location
}

# Create a fresh archive of the current function folder
data "archive_file" "functions" {
  type        = "zip"
  output_path = "temp/function_code_${timestamp()}.zip"
  source_dir  = var.functions_folder
}

# The archive in Cloud Stoage uses the md5 of the zip file
# This ensures the Function is redeployed only when the source is changed.
resource "google_storage_bucket_object" "archive" {
  name = "${var.functions_folder}_${data.archive_file.functions.output_md5}.zip" # will delete old items

  bucket = google_storage_bucket.source.name
  source = data.archive_file.functions.output_path

  depends_on = [data.archive_file.functions]
}