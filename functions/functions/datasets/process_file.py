import base64
import json
import os
from pathlib import Path
from typing import Any, Dict, List

import functions_framework
from cloudevents.http import CloudEvent
from firebase_admin import firestore
from loguru import logger
from utils.annotation import Annotation, TierSelector, process_eaf
from utils.clean_json import clean_json_data
from utils.cloud_storage import download_blob, list_blobs_with_prefix, upload_blob
from utils.firebase import get_firestore_client
from utils.resample import resample

TRANSCRIPTION_EXTENSIONS = {".txt", ".eaf"}
AUDIO_EXTENSIONS = {".wav"}
SAMPLE_RATE = 16_000

FILES_BUCKET = os.environ.get("USER_FILES_BUCKET", "elpiscloud-user-upload-files")
DATASET_BUCKET = os.environ.get("USER_DATASETS_BUCKET", "elpiscloud-user-dataset-files")


@functions_framework.cloud_event
def process_dataset_file(event: CloudEvent) -> None:
    """CloudEvent Function which triggers from pubsub dataset-processing
    topic.

    This processes the incoming file, whose path it can infer from the event. It
    cleans the data inside if it's a transcription file, and saves it to cloud
    storage so that it can be used in training with the dataset it came from.

    Parameters:
         event: The cloud event.

    """
    print(
        f"This Function was triggered by messageId {event['id']} published at {event['time']} to {event['source']}"
    )

    data = base64.b64decode(event.data).decode("utf-8")
    data = json.loads(data)
    print(f"Event data: {data}")

    dataset_name = data["name"]
    file_name = data["file"]
    options = data["options"]
    uid = data["userId"]

    local_file = Path(f"/tmp/{file_name}")

    # Download the necessary file from cloud storage
    download_blob(
        bucket_name=FILES_BUCKET,
        source_blob_name=f"{uid}/{file_name}",
        destination_file_name=local_file,
    )

    # Process the file based on its file type.
    extension = local_file.suffix
    if extension in TRANSCRIPTION_EXTENSIONS:
        processed_file = process_transcription_file(local_file, options)
    elif extension in AUDIO_EXTENSIONS:
        processed_file = process_audio_file(local_file)
    else:
        raise RuntimeError("Unrecognised file extension. Processing halted.")

    # Save the processed file to the datasets folder in cloud storage
    upload_blob(
        bucket_name=DATASET_BUCKET,
        source_file_name=processed_file,
        destination_blob_name=f"{uid}/{dataset_name}/{processed_file.name}",
    )

    check_finished_processing(dataset_name, uid, DATASET_BUCKET)


def process_transcription_file(file: Path, options: Dict[str, Any]) -> Path:
    """Transforms a downloaded transcription file into a standardised json format for training.

    Parameters:
        file: The path of the downloaded file.
        options: The dataset processing options to apply while cleaning.

    Returns:
        The path of the processed transcription file.
    """
    if file.suffix == ".eaf":
        data = extract_elan_data(file, options)
    else:
        data = extract_text_data(file)

    data = clean_data(data, options)

    output_file = Path(f"/tmp/{file.stem}.json")
    with open(output_file, "w") as data_file:
        data_file.write(json.dumps([annotation.to_dict() for annotation in data]))

    return output_file


def extract_elan_data(file: Path, options: Dict[str, Any]) -> List[Annotation]:
    """Extract transcription information from an Elan file.

    Parameters:
        file: The path of the downloaded file.
        options: The dataset processing options to apply while cleaning.

    Returns:
        A list of utterance information for the given file.
    """
    selection_mechanism: str = options["elanOptions"]["selectionMechanism"]
    selection_value = options["elanOptions"]["selectionValue"]

    return process_eaf(file, TierSelector(selection_mechanism), selection_value)


def extract_text_data(file: Path) -> List[Annotation]:
    """Extract transcription information from a text file.

    Parameters:
        file_name: The name of the downloaded file.

    Returns:
        A list of utterance information for the given file.
    """
    with open(file) as transcription_file:
        transcription = transcription_file.read()

    # Returning a dummy format without start and end times.
    return [
        Annotation(
            audio_file_name=file.stem + ".wav",
            transcript=transcription,
        )
    ]


def clean_data(
    annotations: List[Annotation], options: Dict[str, Any]
) -> List[Annotation]:
    """Takes a list of utterance information and cleans it based off the provided
    dataset processing options.

    Parameters:
        annotations: A list of Annotations
        options: A dictionary containing dataset cleaning options.

    Returns:
        A cleaned list of annotations with the cleaning options applied.
    """

    annotation_data = clean_json_data(
        [annotation.to_dict() for annotation in annotations],
        punctuation_to_collapse_by=options["punctuationToRemove"],
        punctuation_to_explode_by=options["punctuationToReplace"],
        special_cases=options["wordsToRemove"].split("\n"),
        translation_tags=options["tagsToRemove"].split("\n"),
    )
    return [Annotation.from_dict(data) for data in annotation_data]


def process_audio_file(file: Path) -> Path:
    """Resamples an audio file at the given Path, and returns the resulting path.

    Parameters:
        file: The path of the file to process
    """
    resample(file=file, destination=file, sample_rate=SAMPLE_RATE)
    return file


def check_finished_processing(
    dataset_name: str, uid: str, datasets_bucket_name: str
) -> None:
    """Determine if all the files in a dataset have been processed, and if so,
    updates the document accordingly in firestore.

    Parameters:
        dataset_name: The name of the dataset to process
        uid: The user id
        datasets_bucket_name: The name of the bucket where user dataset files
                are stored.
    """
    # Get the list of files included in the dataset within firestore
    db = get_firestore_client()
    doc_ref: firestore.firestore.DocumentReference = (
        db.collection("users")
        .document(uid)
        .collection("datasets")
        .document(dataset_name)
    )
    snapshot = doc_ref.get()

    # Error handling  for if user deletes dataset before processing this file.
    if not snapshot.exists:
        raise RuntimeError(
            f"Dataset doesn't exist at users/{uid}/datasets/{dataset_name}"
        )

    dataset = snapshot.to_dict()
    if dataset is None:
        logger.error(f"Dataset users/{uid}/datasets{dataset_name} not found!!")
        return

    file_names = dataset["files"]
    print(f"Firestore dataset file names: {file_names}")

    # Get the list of files currently uploaded to the bucket.
    processed_file_names = list(
        list_blobs_with_prefix(datasets_bucket_name, f"{uid}/{dataset_name}/")
    )
    print(f"Processed file names: {processed_file_names}")

    # Check that the length of each is equal, and if so, set dataset to be processed.
    if len(file_names) == len(processed_file_names):
        doc_ref.update({"processed": True})
