import os
from typing import Dict

from functions_framework import Context
from loguru import logger
from models import Model
from utils.pubsub import publish_to_topic

PUBSUB_TOPIC = os.environ.get("TOPIC_ID", "process_model")


def process_model(data: Dict, context: Context) -> None:
    """Begins processing a dataset so it may be used to train a model.

    Triggers when a new dataset is created. Reads all the files in a new dataset
    and publishes an event to the dataset processing topic for each one.

    Parameters:
        data (dict): The event payload.
        context (Context): Metadata for the event.
    """

    try:
        model = Model.from_firestore_event(data["value"])
        logger.info(f"Firestore newly-created model information: {model}")
    except:
        msg = f'Invalid model data structure: {data["value"]}'
        logger.error(msg)
        return

    publish_to_topic(PUBSUB_TOPIC, [model.to_dict()])
