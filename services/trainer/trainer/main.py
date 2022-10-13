import base64
import json
import os
from http import HTTPStatus
from pathlib import Path

from flask import Flask, Response, request
from loguru import logger
from trainer.cloud_storage import download_blob, list_blobs_with_prefix, upload_blob
from trainer.model_metadata import ModelMetadata
from trainer.trainer import train

app = Flask(__name__)

DATA_PATH = Path("/data")
DATASET_BUCKET = os.environ.get("DATASET_BUCKET", "elpiscloud-user-dataset-files")
MODEL_BUCKET = os.environ.get("MODEL_BUCKET", "elpiscloud-trained-models")

NO_ENVELOPE = "No Pub/Sub message received"
BAD_PUBSUB_MESSAGE_FORMAT = "Invalid Pub/Sub message format"
MISSING_PUBSUB_DATA = "Missing data from Pub/Sub message"
BAD_MODEL_METADATA_FORMAT = "Invalid model metadata format"


@app.route("/", methods=["POST"])
def index():
    """Main class for processing model training requests."""
    # Unwrap the pubsub data and check formatting
    envelope = request.get_json(silent=True)
    if not envelope:
        return bad_request(NO_ENVELOPE)

    if not isinstance(envelope, dict) or "message" not in envelope:
        return bad_request(BAD_PUBSUB_MESSAGE_FORMAT)

    pubsub_message = envelope["message"]
    if isinstance(pubsub_message, dict) and "data" in pubsub_message:
        data = base64.b64decode(pubsub_message["data"]).decode("utf-8").strip()
        logger.info(f"Received training job with data: {data}!")
    else:
        return bad_request(MISSING_PUBSUB_DATA)

    # Attempt to convert data to Model
    try:
        data = json.loads(data)
        metadata = ModelMetadata.from_dict(data)
    except Exception:
        msg = f"{BAD_MODEL_METADATA_FORMAT}: {data}"
        return bad_request(msg)

    response = Response(status=HTTPStatus.NO_CONTENT)

    # Queue the training to happen after returning an ACK response for the
    # pubsub subscription, so it doesn't keep retrying.
    response.call_on_close(lambda: process_training_request(metadata))

    logger.info("Responding with ACK")
    return response


def bad_request(error_message: str) -> Response:
    """Logs the given error message and builds a 400 response to return.

    Parameters:
        error_message: The error message to include in the logs and response.
    """
    logger.error(f"Error: {error_message}")
    return Response(f"Bad Request: {error_message}", status=HTTPStatus.BAD_REQUEST)


def process_training_request(metadata: ModelMetadata):
    """Performs the training workflow given some information about the model.

    Paramters:
        metadata: The metadata of the model training job to perform.
    """
    logger.info("Begin executing training job")

    dataset_path = DATA_PATH / "datasets" / metadata.user_id / metadata.model_name
    download_dataset(metadata=metadata, dataset_path=dataset_path)

    model_path = train(
        metadata=metadata, data_path=DATA_PATH, dataset_path=dataset_path
    )

    upload_model(metadata, model_path)


def download_dataset(metadata: ModelMetadata, dataset_path: Path) -> None:
    """Downloads the processed dataset to the provided path

    Parameters:
        metadata: The metadata of the model training job to use.
        data_path: A path in which to store the dataset
    """
    dataset_prefix = f"{metadata.user_id}/{metadata.model_name}/"
    dataset_path.mkdir(parents=True, exist_ok=True)

    blobs = list_blobs_with_prefix(DATASET_BUCKET, dataset_prefix)
    for blob in blobs:
        local_path = dataset_path / str(blob.name)
        download_blob(DATASET_BUCKET, str(blob.name), local_path)


def upload_model(metadata: ModelMetadata, model_path: Path) -> None:
    """Uploads the trained model to cloud storage.

    Parameters:
        metadata: The metadata of the model training job.
        model_path: The path of the trained model.
    """
    for file in os.listdir(model_path):
        blob_name = f"{metadata.user_id}/{metadata.model_name}/{file}"
        upload_blob(MODEL_BUCKET, model_path / file, blob_name)


if __name__ == "__main__":
    PORT = int(os.getenv("PORT", "8080"))

    # This is used when running locally. Gunicorn is used to run the
    # application on Cloud Run. See entrypoint in Dockerfile.
    app.run(host="127.0.0.1", port=PORT, debug=True)
