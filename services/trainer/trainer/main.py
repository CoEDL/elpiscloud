import base64
import json
import os
from pathlib import Path

from flask import Flask, request
from loguru import logger

from .cloud_storage import download_blob, list_blobs_with_prefix, upload_blob
from .model_metadata import ModelMetadata
from .trainer import train

app = Flask(__name__)

DATA_PATH = Path("/data")
DATASET_BUCKET = os.environ.get("DATASET_BUCKET", "elpiscloud-user-dataset-files")
# TODO Update below when finished
MODEL_BUCKET = os.environ.get("MODEL_BUCKET", "elpiscloud-trained-model-files")


@app.route("/", methods=["POST"])
def index():
    """Main class for processing model training requests."""
    # Unwrap the pubsub data and check formatting
    envelope = request.get_json()
    if not envelope:
        msg = "no Pub/Sub message received"
        logger.error(f"Error: {msg}")
        return f"Bad Request: {msg}", 400

    if not isinstance(envelope, dict) or "message" not in envelope:
        msg = "invalid Pub/Sub message format"
        logger.error(f"Error: {msg}")
        return f"Bad Request: {msg}", 400

    pubsub_message = envelope["message"]
    if isinstance(pubsub_message, dict) and "data" in pubsub_message:
        data = base64.b64decode(pubsub_message["data"]).decode("utf-8").strip()
        logger.info(f"Received training job with info: {data}!")
    else:
        msg = "Missing data from Pub/Sub message"
        logger.error(f"Error: {msg}")
        return f"Bad Request: {msg}", 400

    # Convert data to dict
    data = json.loads(data)
    try:
        metadata = ModelMetadata.from_dict(data)
    except Exception:
        msg = f"Invalid data format: {data}"
        logger.error(f"Error: {msg}")
        return f"Bad Request: {msg}", 400

    dataset_path = DATA_PATH / "datasets" / metadata.user_id / metadata.model_name
    download_dataset(metadata=metadata, dataset_path=dataset_path)

    # Attempt to train the model
    model_path = train(
        metadata=metadata, data_path=DATA_PATH, dataset_path=dataset_path
    )

    upload_results(metadata, model_path)
    return ("", 204)


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


def upload_results(metadata: ModelMetadata, model_path: Path) -> None:
    """Uploads the trained model to cloud storage, and updates the model metadata
    in firebase.

    Parameters:
        metadata: The metadata of the model training job.
        model_path: The path of the trained model.
    """
    # Upload model files
    for file in os.listdir(model_path):
        blob_name = f"{metadata.user_id}/{metadata.model_name}/{file}"
        upload_blob(MODEL_BUCKET, model_path / file, blob_name)

    # TODO Update model metadata


if __name__ == "__main__":
    PORT = int(os.getenv("PORT", "8080"))

    # This is used when running locally. Gunicorn is used to run the
    # application on Cloud Run. See entrypoint in Dockerfile.
    app.run(host="127.0.0.1", port=PORT, debug=True)
