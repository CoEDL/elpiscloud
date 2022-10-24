import firebase_admin
from firebase_admin import credentials, firestore

PROJECT_ID = "elpiscloud"


def get_firestore_client() -> firestore.firestore.Client:
    """Returns a firestore client for the elpiscloud project."""
    cred = credentials.ApplicationDefault()
    app = firebase_admin.initialize_app(
        cred,
        {"projectId": PROJECT_ID},
    )
    return firestore.client(app)
