import base64
import json
import os
from copy import copy
from itertools import chain
from pathlib import Path
from typing import List, Tuple

import utils.audio as audio
from firebase_admin import firestore
from loguru import logger
from models import Annotation, DatasetOptions, ProcessingJob
from utils.clean_text import clean_text
from utils.cloud_storage import download_blob, list_blobs_with_prefix, upload_blob
from utils.extract_annotations import extract_annotations
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
    logger.info(f"Event data: {data}")
    job = ProcessingJob.from_dict(data)

    transcription_file, audio_file = download_files(job)
    annotations = extract_annotations(transcription_file, job.options.elan_options)

    # Resample audio and annotations to standardise for training
    sample_rate = audio.get_sample_rate(audio_file)
    for annotation in annotations:
        annotation.sample_rate = sample_rate

    audio.resample(
        audio_file=audio_file, destination=audio_file, sample_rate=TARGET_SAMPLE_RATE
    )
    annotations = map(
        lambda annotation: annotation.rescale_timestamps(sample_rate), annotations
    )

    # Clean the annotations
    annotations = map(
        lambda annotation: clean_annotation(annotation, job.options), annotations
    )

    # Generate training files from the annotations
    processed_files = chain(
        *map(
            lambda annotation: generate_training_files(annotation, audio_file),
            annotations,
        )
    )

    # Upload all the training files
    for file in processed_files:
        upload_blob(
            DATASET_BUCKET, file, f"{job.user_id}/{job.dataset_name}/{file.name}"
        )

    post_processing_hook(job)


def download_files(job: ProcessingJob, dir: Path = DEFAULT_DIR) -> Tuple[Path, Path]:
    """Download the required transcription and audio files for the job.

    Parameters:
        job: The processing job.
        dir: The directory in which to store the files.

    Returns:
        A tuple containing the path of the downloaded transcription,
        and audio files.
    """
    # Download transcription file
    transcription_file = dir / job.transcription_file_name
    download_blob(
        bucket_name=FILES_BUCKET,
        source_blob_name=f"{job.user_id}/{job.transcription_file_name}",
        destination_file_name=transcription_file,
    )

    # Download audio file
    audio_file = dir / job.audio_file_name
    download_blob(
        bucket_name=FILES_BUCKET,
        source_blob_name=f"{job.user_id}/{job.audio_file_name}",
        destination_file_name=audio_file,
    )
    return transcription_file, audio_file


def clean_annotation(annotation: Annotation, options: DatasetOptions) -> Annotation:
    """Cleans the text within an annotation.

    Parameters:
        annotation: The annotation to clean.
        options: The cleaning options for the dataset.

    Returns:
        A new annotation whose transcript has been cleaned.
    """
    transcript = clean_text(annotation.transcript, options)
    result = copy(annotation)
    result.transcript = transcript
    return result


def generate_training_files(
    annotation: Annotation, audio_file: Path, dir: Path = DEFAULT_DIR
) -> Tuple[Path, Path]:
    """Generates a transcript and audio file pairing for this annotation.

    If the annotation is timed (has a start and stop time), we return a path
    to a new audio file, which is constrained to the given times. Otherwise,
    the annotation spans the entire audio path, and so we return this path,
    unmodified.

    Parameters:
        annotation: The annotation for a given section of audio within the
            supplied audio_file.
        audio_file: The file which the annotation references.

    Returns:
        A tuple containing a transcription and audio file path for the given
            annotation.
    """
    # Get a unique name prefix based on annotation start time
    name = audio_file.stem
    if annotation.start_ms is not None:
        name = f"{name}_{annotation.start_ms}"

    # Save transcription_file
    transcription_file = dir / f"{name}.json"
    with open(transcription_file, "w") as f:
        json.dump(annotation.to_dict(), f)

    # Save audio file.
    # Type ignoring is because is_timed ensures sample_rate, start_ms and stop_ms exist
    if annotation.is_timed():
        cut_audio_file = dir / f"{name}.wav"
        audio.cut(
            audio_file=audio_file,
            destination=cut_audio_file,
            start_ms=annotation.start_ms,  # type: ignore
            stop_ms=annotation.stop_ms,  # type: ignore
        )
        audio_file = cut_audio_file

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

    # Check that the length of each is equal, and if so, set dataset to be processed.
    required_stems = {Path(name).stem for name in dataset_files}
    # Gives back the
    uploaded_stems = {Path(name).stem.split("_")[0] for name in processed_files}
    return required_stems == uploaded_stems
