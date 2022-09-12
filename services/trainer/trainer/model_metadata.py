from dataclasses import dataclass, fields
from enum import Enum
from pathlib import Path
from typing import Any, Dict, List, Optional

import humps
from transformers import TrainingArguments

BASE_MODEL = "facebook/wav2vec2-base-960h"
SAMPLING_RATE = 16_000


class TrainingStatus(Enum):
    WAITING = "waiting"
    TRAINING = "training"
    FINISHED = "finished"


@dataclass
class TrainingOptions:
    batch_size: int = 4
    epochs: int = 2
    learning_rate: float = 1e-4
    min_duration: int = 0
    max_duration: int = 60
    word_delimiter_token: str = " "
    debug_with_subset: bool = False
    training_size: Optional[int] = None
    validation_size: Optional[int] = None

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "TrainingOptions":
        kwargs = {
            field.name: data[field.name]
            for field in fields(TrainingOptions)
            if field.name not in {"training_size", "validation_size"}
        }
        # Remove nesting of debug options
        debug_options = data.get("debug_subset_options", {})
        training_size = debug_options.get("training_set_size", None)
        validation_size = debug_options.get("validation_set_size", None)

        return TrainingOptions(
            training_size=training_size, validation_size=validation_size, **kwargs
        )


@dataclass
class ModelMetadata:
    name: str
    user_id: str
    options: TrainingOptions
    status: TrainingStatus = TrainingStatus.WAITING
    base_model: str = BASE_MODEL
    sampling_rate: int = SAMPLING_RATE

    def to_training_args(self, output_dir: Path) -> TrainingArguments:
        return TrainingArguments(
            output_dir=str(output_dir),
            group_by_length=True,
            per_device_train_batch_size=16,
            evaluation_strategy="steps",
            num_train_epochs=self.options.epochs,
            fp16=True,
            gradient_checkpointing=True,
            learning_rate=self.options.learning_rate,
            weight_decay=0.005,
            save_total_limit=2,
        )

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "ModelMetadata":
        # Convert from JS lowerCamelCase to snake case
        data = humps.decamelize(data)
        return ModelMetadata(
            name=data["name"],
            user_id=data["user_id"],
            options=TrainingOptions.from_dict(data["options"]),
            status=TrainingStatus(data["training_status"]),
            base_model=data.get("base_model", BASE_MODEL),
            sampling_rate=data.get("sampling_rate", SAMPLING_RATE),
        )
