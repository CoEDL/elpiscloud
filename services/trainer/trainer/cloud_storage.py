from pathlib import Path
from typing import Iterable, Optional

from google.cloud import storage
from google.cloud.storage.blob import Blob
from loguru import logger


def download_blob(
    bucket_name: str, source_blob_name: str, destination_path: Path
) -> None:
    """Downloads a blob locally.

    Parameters:
        bucket_name: The ID of your GCS bucket
        source_blob_name: The path to your file within the GCS bucket.
        destination_path: The local path referring to where the blob will be
            downloaded.
    """
    storage_client = storage.Client()

    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(source_blob_name)
    blob.download_to_filename(destination_path)

    logger.info(
        f"Downloaded storage object {source_blob_name} from bucket {bucket_name} to local file {destination_path}."
    )


def upload_blob(
    bucket_name: str, source_path: Path, destination_blob_name: str
) -> None:
    """Uploads a file to the bucket.

    Parameters:
        bucket_name: The ID of your GCS bucket
        source_file_name: The path to your file to upload
        destination_blob_name: The ID of your GCS object
    """
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(destination_blob_name)

    blob.upload_from_filename(source_path)

    logger.info(f"File {source_path} uploaded to {destination_blob_name}.")


def list_blobs_with_prefix(
    bucket_name: str, prefix: str, delimiter: Optional[str] = None
) -> Iterable[Blob]:
    """Lists all the blobs in the bucket that begin with the prefix.
    This can be used to list all blobs in a "folder", e.g. "public/".

    Parameters:
        bucket_name: The ID of your GCS bucket
        prefix: The prefix used to filter blobs
        delimiter: Used together with prefix to emulate hierachy.
    """

    storage_client = storage.Client()

    # Note: Client.list_blobs requires at least package version 1.17.0.
    blobs = storage_client.list_blobs(bucket_name, prefix=prefix, delimiter=delimiter)
    return blobs
