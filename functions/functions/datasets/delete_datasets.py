import os
from typing import Dict

from functions_framework import Context
from loguru import logger
from utils.cloud_storage import delete_folder_blob


def delete_dataset_from_bucket(data: Dict, context: Context) -> None:
    """Cloud function that is setup to be triggered when a dataset is deleted
    from the firestore database.

    This deletes the corresponding dataset from GCP cloud storage.

    Parameters:
        data (dict): The event data (documented at
            https://cloud.google.com/functions/docs/calling/cloud-firestore#functions_eventdata-python)
        context (Context): Metadata for the event.

    """
    logger.info(f"Data: {data}")
    logger.info(f"Context: {context}")

    dataset = data["oldValue"]
    uid = dataset["fields"]["userId"]["stringValue"]
    dataset_name = dataset["fields"]["name"]["stringValue"]

    datasets_bucket_name = os.environ.get("USER_DATASETS_BUCKET")
    delete_folder_blob(
        bucket_name=datasets_bucket_name, target_blob_prefix=f"{uid}/{dataset_name}/"
    )
