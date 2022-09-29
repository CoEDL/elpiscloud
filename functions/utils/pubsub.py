import json
from concurrent import futures
from typing import Any, Callable, List

from google.cloud import pubsub_v1
from google.cloud.pubsub_v1.futures import Future
from loguru import logger


def publish_to_topic(topic_name: str, data: List[Any], timeout: int = 60) -> None:
    """Publish each object in the provided data list as a separate pubsub message
    to the given topic.

    Parameters:
        topic_name: The name of the topic to publish to
        data: A list of objects to serialize, encode and publish as separate messages
        timeout: How long the publishing should wait until erroring.
    """
    publisher = pubsub_v1.PublisherClient()
    publish_futures = []

    def get_callback(publish_future: Future, data: str) -> Callable[[Future], None]:
        def callback(publish_future: Future) -> None:
            try:
                # Wait 60 seconds for the publish call to succeed.
                logger.info(publish_future.result(timeout=timeout))
            except futures.TimeoutError:
                logger.error(f"Publishing {data} timed out.")

        return callback

    for obj in data:
        serialized = json.dumps(obj)
        publish_future: Future = publisher.publish(
            topic_name, serialized.encode("utf-8")
        )
        publish_future.add_done_callback(get_callback(publish_future, serialized))
        publish_futures.append(publish_future)

    futures.wait(publish_futures, return_when=futures.ALL_COMPLETED)
    logger.info(f"Published messages with error handler to {topic_name}.")
