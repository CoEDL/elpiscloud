import datetime
import flask

from google.cloud import storage
from enum import Enum

from utils import cors_preflight, cors_wrap_response, cors_wrap_abort


class UploadTypes(Enum):
    FILES = 'files'


# Note: Must be in sync with terraform buckets
BUCKETS = {
    UploadTypes.FILES: 'elpiscloud-user-upload-files'
}

VALIDATED_USER_INFO = "X-Apigateway-Api-Userinfo"


def sign_files(request: flask.Request):
    """ Signs supplied upload files and returns the urls with which to commence
    uploading.

    Args:
        request (flask.Request): The request object.
        <https://flask.palletsprojects.com/en/1.1.x/api/#incoming-request-data>

    Returns:
        A dictionary of the requested upload files to their signed urls
    """
    # CORS Preflight
    if request.method == 'OPTIONS':
        return cors_preflight(['POST'])

    # Only allow post requests
    if request.method != 'POST':
        print('invalid method')
        cors_wrap_abort(405)

    if not request.is_json:
        print('invalid json body')
        cors_wrap_abort(400)

    if not request.headers.has_key(VALIDATED_USER_INFO):
        print('invalid json body')
        cors_wrap_abort(403)

    user_id = request.headers.get(VALIDATED_USER_INFO)['user_id']
    file_names = request.json['file_names']

    result = {}

    # Make signed urls for all filenames in the request
    bucket = BUCKETS[UploadTypes.FILES]
    for name in file_names:
        blob = f'{user_id}/{name}'
        result[name] = generate_upload_signed_url_v4(bucket, blob)

    print('result: ', result)
    return cors_wrap_response(result, 200)


def generate_upload_signed_url_v4(bucket_name, blob_name):
    """Generates a v4 signed URL for uploading a blob using HTTP PUT.

    Note that this method requires a service account key file. You can not use
    this if you are using Application Default Credentials from Google Compute
    Engine or from the Google Cloud SDK.
    """
    # bucket_name = 'your-bucket-name'
    # blob_name = 'your-object-name'

    storage_client = storage.Client()
    bucket = storage_client.bucket(bucket_name)
    blob = bucket.blob(blob_name)

    url = blob.generate_signed_url(
        version="v4",
        # This URL is valid for 15 minutes
        expiration=datetime.timedelta(minutes=15),
        # Allow PUT requests using this URL.
        method="PUT",
        content_type="application/octet-stream",
    )

    return url
