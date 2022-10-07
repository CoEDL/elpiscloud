import os
from typing import Dict

from functions_framework import Context
from humps.main import decamelize
from loguru import logger
from models import Dataset
from utils.cloud_storage import delete_folder_blob
from utils.firestore_event_converter import unpack

DATASET_BUCKET_NAME = os.environ.get("USER_DATASETS_BUCKET", "dataset_bucket")


def delete_dataset_from_bucket(data: Dict, context: Context) -> None:
    """Cloud function that is setup to be triggered when a dataset is deleted
    from the firestore database.

    This deletes the corresponding dataset from GCP cloud storage.

    Parameters:
        data (dict): The event data (documented at
            https://cloud.google.com/functions/docs/calling/cloud-firestore#functions_eventdata-python)
        context (Context): Metadata for the event.

    """
    logger.info("Cloud storage cleanup after firestore dataset deletion...")
    logger.info(f"Raw firestore dataset event: {data}")

    dataset = decamelize(unpack(data["oldValue"]))
    dataset = Dataset.from_dict(dataset)

    delete_folder_blob(
        bucket_name=DATASET_BUCKET_NAME,
        target_blob_prefix=f"{dataset.user_id}/{dataset.name}/",
    )
    logger.success(f"Successfully deleted dataset: {dataset.user_id}/{dataset.name}/")
