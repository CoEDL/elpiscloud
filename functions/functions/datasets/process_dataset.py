import os
from typing import Dict

from functions_framework import Context
from humps.main import decamelize
from loguru import logger
from models.dataset import CloudDataset, ProcessingJob
from utils.firestore_event_converter import unpack
from utils.pubsub import publish_to_topic

TOPIC_NAME = os.environ.get("TOPIC_ID", "dataset_processing_topic")


def process_dataset(data: Dict, context: Context) -> None:
    """Begins processing a dataset so it may be used to train a model.

    Triggers when a new dataset is created. Reads all the files in a new dataset
    and publishes an event to the dataset processing topic for each one.

    Parameters:
        data (dict): The event payload.
        context (Context): Metadata for the event.
    """
    # Convert the firestore event into a dataset object.
    dataset = decamelize(unpack(data["value"]))
    dataset = CloudDataset.from_dict(dataset)

    logger.info(f"Firestore newly-created dataset information: {dataset}")

    jobs = map(ProcessingJob.to_dict, dataset.to_jobs())
    publish_to_topic(topic_name=TOPIC_NAME, data=jobs)
