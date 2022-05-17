import os
import json

from typing import Any, Callable, Dict
from concurrent import futures
from google.cloud import pubsub_v1
from grpc import Future
from functions_framework import Context


def process_dataset(data: Dict, context: Context) -> None:
    """Begins processing a dataset so it may be used to train a model.

    Triggers when a new dataset is created. Reads all the files in a new dataset
    and publishes an event to the dataset processing topic for each one.

    Parameters:
        data (dict): The event payload.
        context (Context): Metadata for the event.
    """
    # Set up the topic for publishing
    publisher = pubsub_v1.PublisherClient()
    topic_path = os.environ.get("TOPIC_ID")
    publish_futures = []

    def get_callback(
        publish_future: pubsub_v1.publisher.futures.Future, data: str
    ) -> Callable[[pubsub_v1.publisher.futures.Future], None]:
        def callback(publish_future: pubsub_v1.publisher.futures.Future) -> None:
            try:
                # Wait 60 seconds for the publish call to succeed.
                print(publish_future.result(timeout=60))
            except futures.TimeoutError:
                print(f"Publishing {data} timed out.")

        return callback

    dataset = data["value"]
    print(f"Firestore newly-created dataset information: {dataset}")

    # Firestore has a disgusting format for the data inside it, as seen below
    file_names = [
        field["stringValue"]
        for field in dataset["fields"]["files"]["arrayValue"]["values"]
    ]

    # Add a processing job to the to processing topic for each one of the files
    for file_name in file_names:
        # Take the important info from the firestore object
        file_processing_data = {
            "name": dataset["fields"]["name"]["stringValue"],
            "file": file_name,
            "options": clean_up_options(dataset["fields"]["options"]),
            "userId": dataset["fields"]["userId"]["stringValue"],
        }
        encoded_data = json.dumps(file_processing_data).encode("utf-8")

        # Generate the future from publishing, and add it to our list.
        publish_future: Future = publisher.publish(topic_path, encoded_data)
        publish_future.add_done_callback(
            get_callback(publish_future, file_processing_data)
        )
        publish_futures.append(publish_future)

    # Wait for all the publish futures to resolve before exiting.
    futures.wait(publish_futures, return_when=futures.ALL_COMPLETED)

    print(f"Published messages with error handler to {topic_path}.")


def clean_up_options(dataset_options: Dict) -> Dict[str, Any]:
    """Cleans up the firestore value padding in the dataset preparation options
    returned in a firestore event.

    Parameters:
        dataset_options (Dict): A dictionary containing the preparation options
            with copious value padding.

    Returns:
        (Dict): A dictionary of the same format as the original firestore
            document. That is, without any value padding.
    """
    result = {}
    base = dataset_options["mapValue"]["fields"]

    # Clean up regular options
    result = {
        option: value["stringValue"]
        for (option, value) in base.items()
        if option != "elanOptions"
    }

    # Clean up elan options
    elan_options = {}
    for field in {"selectionMechanism", "selectionValue"}:
        elan_options[field] = base["elanOptions"]["mapValue"]["fields"][field][
            "stringValue"
        ]

    result["elanOptions"] = elan_options
    return result
