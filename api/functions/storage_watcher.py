from utils import get_firestore_client


def storage_watcher(event, context):
    """Background Cloud Function to be triggered by Cloud Storage.
       This generic function logs relevant data when a file is changed.
    Args:
        event (dict):  The dictionary with data specific to this type of event.
                       The `data` field contains a description of the event in
                       the Cloud Storage `object` format described here:
                       https://cloud.google.com/storage/docs/json_api/v1/objects#resource
        context (google.cloud.functions.Context): Metadata of triggering event.
    Returns:
        None; the output is written to Stackdriver Logging
    """
    uid, file_name = event['name'].split('/')
    content_type = event['contentType']
    created = event['timeCreated']
    size = event['size']

    data = {
        'userID': uid,
        'fileName': file_name,
        'contentType': content_type,
        'timeCreated': created,
        'size': size,
        'tags': []
    }

    db = get_firestore_client()
    user_ref = db.collection('users').document(uid)
    file_ref = user_ref.collection('files').document(file_name)

    file_ref.set(data)
