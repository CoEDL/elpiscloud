import json
import os
import shutil
from functools import reduce
from pathlib import Path
from typing import Dict, List

from datasets import Audio, load_dataset
from datasets.dataset_dict import DatasetDict
from trainer.model_metadata import ModelMetadata
from transformers.models.wav2vec2.processing_wav2vec2 import Wav2Vec2Processor

from .utterance import Utterance

PROCESSOR_COUNT = 4


def create_dataset(
    metadata: ModelMetadata, dataset_path: Path, cache_dir: Path
) -> DatasetDict:
    processed_path = dataset_path / "processed"
    _process_dataset(dataset_path, processed_path)

    dataset = load_dataset(
        "json", cache_dir=str(cache_dir), data_dir=str(processed_path)
    )
    dataset = dataset.cast_column("audio", Audio(sampling_rate=metadata.sampling_rate))

    return dataset["train"].train_test_split(test_size=0.2)  # type: ignore


def _process_dataset(dataset_dir: Path, output_dir: Path) -> None:
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
    def prepare_dataset(batch: Dict[str, List]) -> Dict[str, List]:
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
