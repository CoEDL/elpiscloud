import base64
import os
import json
from pathlib import Path

from flask import Flask, request
from loguru import logger

from .model_metadata import ModelMetadata
from .trainer import train

app = Flask(__name__)

DATA_PATH = Path("/data")


@app.route("/", methods=["POST"])
def index():
    """Processes model training requests."""
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

    # Download model metadata and dataset
    setup_training_files(metadata=metadata, data_path=DATA_PATH)

    # Attempt to train the model
    model_path = train(metadata=metadata, data_path=DATA_PATH)
    if model_path is None:
        msg = "Training failed, exiting without uploading model"
        logger.error(f"Error: {msg}")
        return f"Error: {msg}", 500

    upload_results(metadata, model_path)
    return ("", 204)


def setup_training_files(metadata: ModelMetadata, data_path: Path) -> None:
    """Downloads the processed dataset to the provided path

    Parameters:
        metadata: The metadata of the model training job to use.
        data_path: A path in which to store the dataset and pretrained model.
    """
    ...


def upload_results(metadata: ModelMetadata, model_path: Path) -> None:
    """Uploads the trained model to cloud storage, and updates the model metadata
    in firebase.

    Parameters:
        metadata: The metadata of the model training job.
        model_path: The path of the trained model.
    """
    ...


if __name__ == "__main__":
    PORT = int(os.getenv("PORT", "8080"))

    # This is used when running locally. Gunicorn is used to run the
    # application on Cloud Run. See entrypoint in Dockerfile.
    app.run(host="127.0.0.1", port=PORT, debug=True)
