from dataclasses import dataclass
from pathlib import Path
from typing import Dict, List, Optional, Union

import torch
from transformers import AutoModelForCTC, AutoProcessor, Trainer

from .dataset import create_dataset, prepare_dataset
from .model_metadata import ModelMetadata


def train(
    metadata: ModelMetadata, data_path: Path, dataset_path: Path
) -> Optional[Path]:
    dataset = create_dataset(metadata, dataset_path)
    processor = AutoProcessor.from_pretrained(metadata.base_model)
    dataset = prepare_dataset(dataset, processor)

    model = AutoModelForCTC.from_pretrained(
        metadata.base_model,
        ctc_loss_reduction="mean",
        pad_token_id=processor.tokenizer.pad_token_id,
    )
    data_collator = DataCollatorCTCWithPadding(processor=processor, padding=True)
    output_path = data_path / "output"
    output_path.mkdir(exist_ok=True, parents=True)

    trainer = Trainer(
        model=model,
        args=metadata.to_training_args(output_path),
        train_dataset=dataset["train"],
        eval_dataset=dataset["test"],
        tokenizer=processor.feature_extractor,
        data_collator=data_collator,
    )
    trainer.train()
    return output_path


@dataclass
class DataCollatorCTCWithPadding:
    processor: AutoProcessor
    padding: Union[bool, str] = True

    def __call__(
        self, features: List[Dict[str, Union[List[int], torch.Tensor]]]
    ) -> Dict[str, torch.Tensor]:
        # split inputs and labels since they have to be of different lengths and need
        # different padding methods
        input_features = [
            {"input_values": feature["input_values"]} for feature in features
        ]
        label_features = [{"input_ids": feature["labels"]} for feature in features]

        batch = self.processor.pad(
            input_features,
            padding=self.padding,
            return_tensors="pt",
        )
        with self.processor.as_target_processor():
            labels_batch = self.processor.pad(
                label_features,
                padding=self.padding,
                return_tensors="pt",
            )

        # replace padding with -100 to ignore loss correctly
        labels = labels_batch["input_ids"].masked_fill(
            labels_batch.attention_mask.ne(1), -100
        )

        batch["labels"] = labels
        return batch
