import base64
import os
import json
from pathlib import Path
from typing import Any, Dict, List

from google.cloud import pubsub_v1
from functions_framework import Context
from utils.cloud_storage import download_blob, upload_blob, list_blobs_with_prefix
from utils.firebase import get_firestore_client
from utils.elan_to_json import process_eaf
from utils.clean_json import clean_json_data
from firebase_admin import firestore

TRANSCRIPTION_EXTENSIONS = {"txt", "eaf"}
AUDIO_EXTENSIONS = {"wav"}


def process_dataset_file(event: pubsub_v1.types.message, context: Context) -> None:
    """Background Cloud Function which triggers from pubsub dataset-processing
    topic.

    This processes the incoming file, whose path it can infer from the event. It
    cleans the data inside if it's a transcription file, and saves it to cloud
    storage so that it can be used in training with the dataset it came from.

    Parameters:
         event:  The dictionary with data specific to this type of
                        event. The `@type` field maps to
                         `type.googleapis.com/google.pubsub.v1.PubsubMessage`.
                        The `data` field maps to the PubsubMessage data
                        in a base64-encoded string. The `attributes` field maps
                        to the PubsubMessage attributes if any is present.
         context: Metadata of triggering event.

    """
    print(
        f"This Function was triggered by messageId {context.event_id} published at {context.timestamp} to {context.resource['name']}"
    )

    data = base64.b64decode(event["data"]).decode("utf-8")
    data = json.loads(data)
    print(f"Event data: {data}")

    dataset_name = data["name"]
    file_name = data["file"]
    options = data["options"]
    uid = data["userId"]

    local_file = f"/tmp/{file_name}"

    # Download the necessary file from cloud storage
    files_bucket_name = os.environ.get("USER_FILES_BUCKET")
    download_blob(files_bucket_name, f"{uid}/{file_name}", local_file)

    # Process the file based on its file type.
    extension = file_name.split(".")[-1]
    if extension in TRANSCRIPTION_EXTENSIONS:
        processed_file = process_transcription_file(file_name, options)
    elif extension in AUDIO_EXTENSIONS:
        processed_file = process_audio_file(file_name)
    else:
        raise RuntimeError("Unrecognised file extension. Processing halted.")

    # Save the processed file to the datasets folder in cloud storage
    datasets_bucket_name = os.environ.get("USER_DATASETS_BUCKET")
    upload_blob(
        datasets_bucket_name, local_file, f"{uid}/{dataset_name}/{processed_file.name}"
    )

    # Check to see if we have all the files to set the dataset status as processed
    check_finished_processing(dataset_name, uid, datasets_bucket_name)


def process_transcription_file(file_name: str, options: Dict[str, Any]) -> Path:
    """Transforms a downloaded transcription file into a standardised json format for training.

    Parameters:
        file_name: The name of the downloaded file.
        options: The dataset processing options to apply while cleaning.

    Returns:
        The path of the processed transcription file.
    """
    *file_prefix, extension = file_name.split(".")
    if extension == "eaf":
        data = extract_elan_data(file_name, options)
    else:
        data = extract_text_data(file_name)

    data = clean_data(data, options)
    output_file = Path(f"/tmp/{''.join(file_prefix)}.json")

    with open(output_file, "w") as data_file:
        data_file.write(json.dumps(data))

    return output_file


def extract_elan_data(file_name: str, options: Dict[str, Any]) -> List[Dict[str, str]]:
    """Extract transcription information from an Elan file.

    Parameters:
        file_name: The name of the downloaded file.
        options: The dataset processing options to apply while cleaning.

    Returns:
        A list of utterance information for the given file.
    """
    selection_mechanism: str = options["elanOptions"]["selectionMechanism"]
    selection_value = options["elanOptions"]["selectionValue"]
    file_path = Path(f"/tmp/{file_name}")

    if selection_mechanism == "tier_name":
        return process_eaf(file_path, tier_name=selection_value)
    elif selection_mechanism == "tier_type":
        return process_eaf(file_path, tier_type=selection_value)
    else:
        try:
            order = int(selection_value)
        except:
            order = 0

        return process_eaf(file_path, tier_order=order)


def extract_text_data(file_name: str) -> List[Dict[str, str]]:
    """Extract transcription information from a text file.

    Parameters:
        file_name: The name of the downloaded file.

    Returns:
        A list of utterance information for the given file.
    """
    *file_prefix, _ = file_name.split(".")
    file_prefix = "".join(file_prefix)

    with open(file_name) as transcription_file:
        transcription = transcription_file.read()

    # Returning a dummy format without start and end times.
    return [
        {
            "audio_file_name": file_prefix + ".wav",
            "transcript": transcription,
        }
    ]


def clean_data(
    transcription_data: List[Dict[str, str]], options: Dict[str, Any]
) -> List[Dict[str, str]]:
    """Takes a list of utterance information and cleans it based off the provided
    dataset processing options.

    Parameters:
        transcription_data: A list of information about utternaces in the transcription.
        options: A dictionary containing dataset cleaning options.

    Returns:
        A cleaned list of utterances with the cleaning options applied.
    """
    return clean_json_data(
        transcription_data,
        punctuation_to_collapse_by=options["punctuationToRemove"],
        punctuation_to_explode_by=options["punctuationToReplace"],
        special_cases=options["wordsToRemove"].split("\n"),
        translation_tags=options["tagsToRemove"].split("\n"),
    )


def process_audio_file(file_name: str) -> Path:
    return Path(f"/tmp/{file_name}")


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
