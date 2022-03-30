def process_dataset(data, context):
    """ Begins processing a dataset so it may be used to train a model.

    Triggers when a new dataset is created.

    Parameters:
        data (dict): The event payload.
        context (google.cloud.functions.Context): Metadata for the event.
    """
    trigger_resource = context.resource
    print('Function triggered by change to: %s' % trigger_resource)

    # read the required files
    # add a processing job to the to processing queue for each one of the files
