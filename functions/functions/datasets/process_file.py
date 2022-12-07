import base64
import json
import os
from pathlib import Path
from typing import List, Tuple

from elpis.datasets import process_batch
from firebase_admin import firestore
from loguru import logger
from models import ProcessingJob
from utils.cloud_storage import download_blob, list_blobs_with_prefix, upload_blob
from utils.firebase import get_firestore_client

DEFAULT_DIR = Path("/tmp/")
TARGET_SAMPLE_RATE = 16_000
FILES_BUCKET = os.environ.get("USER_FILES_BUCKET", "elpiscloud-user-upload-files")
DATASET_BUCKET = os.environ.get("USER_DATASETS_BUCKET", "elpiscloud-user-dataset-files")


def process_dataset_file(event, context) -> None:
    """CloudEvent Function which triggers from pubsub dataset-processing
    topic.

    This processes the incoming file, whose path it can infer from the event. It
    cleans the data inside if it's a transcription file, and saves it to cloud
    storage so that it can be used in training with the dataset it came from.

    Parameters:
         event: The cloud event.

    """
    # Decode and deserialize the processing job
    data = base64.b64decode(event["data"]).decode("utf-8")
    data = json.loads(data)
    try:
        job = ProcessingJob.from_dict(data)
    except Exception as error:
        logger.error(f"Failed to deserialize job: {data}")
        logger.error(error)
        return

    transcription_file, audio_file = download_files(job)
    job.transcription_file = transcription_file
    job.audio_file = audio_file

    processed_files = process_batch(job, output_dir=DEFAULT_DIR)

    # Upload all the training files
    for file in processed_files:
        upload_blob(
            DATASET_BUCKET, file, f"{job.user_id}/{job.dataset_name}/{file.name}"
        )

    post_processing_hook(job)


def download_files(job: ProcessingJob, dir: Path = DEFAULT_DIR) -> Tuple[Path, Path]:
    """Download the required transcription and audio files for the job.

    Parameters:
        job: The job to process.
        dir: The directory in which to store the files.

    Returns:
        A tuple containing the path of the downloaded transcription,
        and audio files.
    """
    # Download transcription file
    transcription_file = dir / job.transcription_file
    download_blob(
        bucket_name=FILES_BUCKET,
        source_blob_name=f"{job.user_id}/{job.transcription_file}",
        destination_file_name=transcription_file,
    )

    # Download audio file
    audio_file = dir / job.audio_file
    download_blob(
        bucket_name=FILES_BUCKET,
        source_blob_name=f"{job.user_id}/{job.audio_file}",
        destination_file_name=audio_file,
    )
    return transcription_file, audio_file


def post_processing_hook(job: ProcessingJob) -> None:
    """Determine if all the files in a dataset have been processed, and if so,
    updates the document accordingly in firestore.

    Parameters:
        job: The dataset processing job to check
    """
    # Get the list of files included in the dataset within firestore
    db = get_firestore_client()
    doc_ref: firestore.firestore.DocumentReference = (
        db.collection("users")
        .document(job.user_id)
        .collection("datasets")
        .document(job.dataset_name)
    )
    snapshot = doc_ref.get()

    # Error handling  for if user deletes dataset before processing this file.
    if not snapshot.exists:
        raise RuntimeError(
            f"Dataset doesn't exist at users/{job.user_id}/datasets/{job.dataset_name}"
        )

    dataset = snapshot.to_dict()
    if dataset is None:
        logger.error(
            f"Dataset users/{job.user_id}/datasets/{job.dataset_name} not found!!"
        )
        return

    file_names: List[str] = dataset["files"]
    logger.info(f"Firestore dataset file names: {file_names}")

    # Get the list of files currently uploaded to the bucket.
    processed_file_names = [
        str(blob.name)
        for blob in list_blobs_with_prefix(
            DATASET_BUCKET, f"{job.user_id}/{job.dataset_name}/"
        )
    ]
    logger.info(f"Processed file names: {processed_file_names}")

    if has_finished_processing(file_names, processed_file_names):
        doc_ref.update({"processed": True})


def has_finished_processing(
    dataset_files: List[str], processed_files: List[str]
) -> bool:
    """Checks whether the dataset has finished processing.

    Parameters:
        dataset_files: A list of names of the files in the dataset.
        processed_files: A list of names of files uploaded to cloud storage for
            the corresponding dataset.

    Returns:
        true iff the supplied list of processed files would be a valid
        processed dataset for the initial files.
    """

    required_stems = {Path(name).stem for name in dataset_files}
    uploaded_stems = {Path(name).stem for name in processed_files}

    def is_processed(required_stem: str) -> bool:
        starts_with_required_stem = lambda stem: stem.startswith(required_stem)
        return any(map(starts_with_required_stem, uploaded_stems))

    return all(map(is_processed, required_stems))
