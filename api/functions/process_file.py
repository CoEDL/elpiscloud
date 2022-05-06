import base64
import os
from typing import Any, Dict

from google.cloud import pubsub_v1
from functions_framework import Context
from utils.cloud_storage import download_blob, upload_blob

TRANSCRIPTION_EXTENSIONS = ["txt", "eaf"]
AUDIO_EXTENSIONS = ["wav"]


def process_dataset_file(event: pubsub_v1.types.message, context: Context) -> None:
    """Background Cloud Function which triggers from pubsub dataset-processing
    topic.

    This processes the incoming file, whose path it can infer from the event. It
    cleans the data inside if it's a transcription file, and saves it to cloud
    storage so that it can be used in training with the dataset it came from.

    Parameters:
         event (dict):  The dictionary with data specific to this type of
                        event. The `@type` field maps to
                         `type.googleapis.com/google.pubsub.v1.PubsubMessage`.
                        The `data` field maps to the PubsubMessage data
                        in a base64-encoded string. The `attributes` field maps
                        to the PubsubMessage attributes if any is present.
         context (google.cloud.functions.Context): Metadata of triggering event.

    """
    print(
        f"This Function was triggered by messageId {context.event_id} published at {context.timestamp} to {context.resource['name']}"
    )

    data = base64.b64decode(event["data"]).decode("utf-8")
    print(f"Event data: {data}")

    dataset_name = data["name"]
    file_name = data["file"]
    options = data["options"]
    uid = data["userId"]

    # Download the necessary file from cloud storage
    files_bucket_name = os.environ.get("USER_FILES_BUCKET")
    download_blob(files_bucket_name, f"{uid}/{file_name}", file_name)

    # Process the file based on its file type.
    extension = file_name.split(".")[-1]

    if extension in TRANSCRIPTION_EXTENSIONS:
        process_transcription(file_name, options)
    elif extension in AUDIO_EXTENSIONS:
        process_audio(file_name)
    else:
        print("Unrecognised file extension. Processing halted.")
        return

    # Save the processed file to the datasets folder in cloud storage
    datasets_bucket_name = os.environ.get("USER_DATASETS_BUCKET")
    upload_blob(datasets_bucket_name, file_name, f"{uid}/{dataset_name}/{file_name}")

    # Check to see if we have all the files to set the dataset status as processed


def process_transcription(file_name: str, options: Dict[str, Any]) -> None:
    pass


def process_audio(file_name: str) -> None:
    pass
