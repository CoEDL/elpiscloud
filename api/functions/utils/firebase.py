import firebase_admin
from firebase_admin import credentials
from firebase_admin import firestore


def get_firestore_client():
    project_id = "elpiscloud"

    cred = credentials.ApplicationDefault()
    default_app = firebase_admin.initialize_app(
        cred,
        {
            "projectId": project_id,
        },
    )
    return firestore.client()
