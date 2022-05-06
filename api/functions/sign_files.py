from typing import Dict, Tuple
import flask
import json
from enum import Enum
from google.cloud import storage
from utils.cors import (
    cors_preflight,
    cors_wrap_response,
    cors_wrap_abort,
)
from utils.auth import decode_auth_header


class UploadTypes(Enum):
    FILES = "files"


# Note: Must be in sync with terraform buckets
BUCKETS = {UploadTypes.FILES: "elpiscloud-user-upload-files"}

VALIDATED_USER_INFO = "X-Apigateway-Api-Userinfo"


def sign_files(request: flask.Request) -> Tuple[Dict[str, str], int, Dict[str, str]]:
    """Signs supplied upload files and returns the urls with which to commence
    uploading.

    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>

    Returns:
        A tuple containing three values:
            1. A dictionary of filenames to their corresponding signed upload urls
            2. The HTTP response status
            3. A dictionary containing CORS headers.
    """
    print("Flask Request:", request)
    # CORS Preflight
    if request.method == "OPTIONS":
        return cors_preflight(["POST"])

    # Only allow post requests
    if request.method != "POST":
        cors_wrap_abort(405)

    if not request.is_json:
        cors_wrap_abort(400)

    if not request.headers.has_key(VALIDATED_USER_INFO):
        cors_wrap_abort(403)

    user_info = decode_auth_header(request.headers.get(VALIDATED_USER_INFO))
    print("user_info as string:", str(user_info))
    user_info = json.loads(user_info)
    print("user_info as a Python Object:", str(user_info))

    result = {}
    user_id = user_info.get("user_id")
    origin = request.headers.get("Origin", "*")
    file_names = request.json["file_names"]

    # Make signed urls for all filenames in the request
    bucket = BUCKETS[UploadTypes.FILES]
    for name in file_names:
        blob_name = f"{user_id}/{name}"
        result[name] = generate_resumable_upload_url(bucket, blob_name, origin)

    print("result:", result)
    return cors_wrap_response(result, 200)


def generate_resumable_upload_url(bucket_name: str, blob_name: str, origin: str) -> str:
    """Generates a v4 signed URL for uploading a blob using HTTP PUT.

    Parameters:
        bucket_name (str): The name of the bucket where we want to upload the file.
        blob_bame (str): The eventual path to the file within the bucket.
        origin (str): The origin of the request

    Returns:
        (str): The signed upload url.
    """
    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    url = blob.create_resumable_upload_session(
        content_type="application/octet-stream", origin=origin
    )

    return url
