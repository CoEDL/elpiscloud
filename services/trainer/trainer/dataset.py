import json
import os
from functools import reduce
from pathlib import Path
from typing import Dict, List

from datasets import Audio, load_dataset
from datasets.dataset_dict import DatasetDict
from trainer.model_metadata import ModelMetadata
from trainer.utterance import Utterance
from transformers import Wav2Vec2Processor

PROCESSOR_COUNT = 4


def create_dataset(
    metadata: ModelMetadata, dataset_path: Path, cache_dir: Path
) -> DatasetDict:
    """Creates a dataset with test/train splits from the data within a given
    directory.

    Parameters:
        metadata: The metadata for the model training job.
        dataset_path: The path to the unprocessed dataset files.
        cache_dir: The path to save the processed dataset.

    Returns:
        A dataset dictionary with test and train splits.
    """

    processed_path = dataset_path / "processed"
    _process_dataset(dataset_path, processed_path)

    dataset = load_dataset(
        "json", cache_dir=str(cache_dir), data_dir=str(processed_path)
    )
    dataset = dataset.cast_column("audio", Audio(sampling_rate=metadata.sampling_rate))

    return dataset["train"].train_test_split(test_size=metadata.options.test_size)  # type: ignore


def _process_dataset(dataset_dir: Path, output_dir: Path) -> None:
    """Processes the files contained within a dataset directory, and writes
    the processed files to the output dir.

    Note: This is a workaround function which came about because currently,
    one transcript json file has many utterances generated from the same
    audio file. This causes some annoyance when wanting to generate a dataset-
    ideally we'd want the input audio files to be split into utterances.
    As a temporary fix, we just combine the utterances into one larger one.

    Parameters:
        datset_dir: The path to the unprocessed dataset
        output_dir: The path in which to put the processed dataset

    TODO: Delete/rework this as soon as the process_dataset cloud function
    improves.
    """
    files = [dataset_dir / file for file in os.listdir(dataset_dir)]
    files = filter(lambda file: file.suffix == ".json", files)

    # Make sure output dir exists
    output_dir.mkdir(parents=True, exist_ok=True)

    for file in files:
        with open(file) as f:
            utterances = map(Utterance.from_dict, json.load(f))
        utterance = reduce(Utterance.combine, utterances)

        path = output_dir / file.name
        with open(path, "w") as out_file:
            json.dump(utterance.to_dict(dataset_dir), out_file)


def prepare_dataset(dataset: DatasetDict, processor: Wav2Vec2Processor) -> DatasetDict:
    """Runs some preprocessing over the given dataset.

    TODO: I'm going to be honest, I have no idea what this does, and need some
    smart ML knight in shining armour to write a propert description.

    Parameters:
        dataset: The dataset to apply the preprocessing
        processor: The processor to apply over the dataset
    """

    def prepare_dataset(batch: Dict) -> Dict[str, List]:
        audio = batch["audio"]

        batch["input_values"] = processor(
            audio["array"], sampling_rate=audio["sampling_rate"]
        ).input_values[0]
        batch["input_length"] = len(batch["input_values"])

        with processor.as_target_processor():
            batch["labels"] = processor(batch["transcription"]).input_ids

        return batch

    return dataset.map(
        prepare_dataset,
        remove_columns=dataset.column_names["train"],
        num_proc=PROCESSOR_COUNT,
    )
