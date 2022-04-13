import os
from concurrent import futures
from typing import Callable
from google.cloud import pubsub_v1
import json


def process_dataset(data, context):
    """ Begins processing a dataset so it may be used to train a model.

    Triggers when a new dataset is created. Reads all the files in a new dataset
    and publishes an event to the dataset processing topic for each one.

    Parameters:
        data (dict): The event payload.
        context (google.cloud.functions.Context): Metadata for the event.
    """
    # Set up the topic for publishing
    project_id = os.environ.get('PROJECT')
    topic_id = os.environ.get('TOPIC_ID')

    publisher = pubsub_v1.PublisherClient()
    topic_path = publisher.topic_path(project_id, topic_id)
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

    # Read the required files
    dataset = data['value']
    print(dataset)
    # Firestore has a disgusting format for the data inside it, as seen below
    file_names = [field['stringValue']
                  for field in dataset['fields']['files']['arrayValue']['values']]

    # Add a processing job to the to processing topic for each one of the files
    for file in file_names:
        # Take the important info from the firestore object
        data = {
            'name': dataset['fields']['name']['stringValue'],
            'file': file,
            'options': clean_up_options(dataset['fields']['options']),
            'userId': dataset['fields']['userId']['stringValue']
        }

        # When you publish a message, the client returns a future.
        publish_future = publisher.publish(topic_path, data.encode("utf-8"))
        # Non-blocking. Publish failures are handled in the callback function.
        publish_future.add_done_callback(get_callback(publish_future, data))
        publish_futures.append(publish_future)

    # Wait for all the publish futures to resolve before exiting.
    futures.wait(publish_futures, return_when=futures.ALL_COMPLETED)

    print(f"Published messages with error handler to {topic_path}.")


def clean_up_options(options):
    """Cleans up the absolutely ridiculous value padding firestore does with their events.

    This code is so digusting- I am ashamed of what I have written please never mention this to me.
    """
    result = {}
    base = options['mapValue']['fields']

    # Clean up regular options
    for option in base:
        if option != 'elanOptions':
            result[option] = base[option]['stringValue']

    # Clean up elan options
    result['elanOptions'] = {}
    for field in 'selectionMechanism', 'selectionValue':
        result['elanOptions'][field] = base['elanOptions']['mapValue']['fields'][field]['stringValue']

    return result


def process_dataset_file(event, context):
    """Background Cloud Function which triggers from pubsub dataset-processing
    topic.

    This processes the incoming file, whose path it can infer from the event. It
    cleans the data inside if it's a transcription file, and saves it to cloud
    storage so that it can be used in training with the dataset it came from.

    Parameters:
         event (dict):  The dictionary with data specific to this type of
                        event. The `@type` field maps to
                         `type.googleapis.com/google.pubsub.v1.PubsubMessage`.
                        The `data` field maps to the PubsubMessage data
                        in a base64-encoded string. The `attributes` field maps
                        to the PubsubMessage attributes if any is present.
         context (google.cloud.functions.Context): Metadata of triggering event.

    """
    import base64

    print("""This Function was triggered by messageId {} published at {} to {}
    """.format(context.event_id, context.timestamp, context.resource["name"]))

    data = base64.b64decode(event['data']).decode('utf-8')
    print(f'Event data: {data}')

    # Download the necessary file from cloud storage

    # Check to see if it's a transcription file
    # If so, process it.

    # Save the processed file to the datasets folder in cloud storage

    # Check to see if we have all the files to set the dataset status as processed
