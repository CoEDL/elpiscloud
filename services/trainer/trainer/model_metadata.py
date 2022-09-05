from dataclasses import dataclass, fields
from enum import Enum
from typing import Any, Dict, List, Optional

import humps


class TrainingStatus(Enum):
    WAITING = "waiting"
    TRAINING = "training"
    FINISHED = "finished"


@dataclass
class Dataset:
    name: str
    files: List[str]
    processed: bool

    @staticmethod
    def from_dict(dict: Dict[str, Any]) -> "Dataset":
        kwargs = {field.name: dict[field.name] for field in fields(Dataset)}
        return Dataset(**kwargs)


@dataclass
class TrainingOptions:
    batch_size: int
    epochs: int
    learning_rate: float
    min_duration: int
    max_duration: int
    word_delimiter_token: str
    debug_with_subset: bool = False
    training_size: Optional[int] = None
    validation_size: Optional[int] = None

    @staticmethod
    def from_dict(dict: Dict[str, Any]) -> "TrainingOptions":
        kwargs = {
            field.name: dict[field.name]
            for field in fields(TrainingOptions)
            if field.name not in {"training_size", "validation_size"}
        }
        # Remove nesting of debug options
        debug_options = dict.get("debug_subset_options", {})
        training_size = debug_options.get("training_set_size", None)
        validation_size = debug_options.get("validation_set_size", None)

        return TrainingOptions(
            training_size=training_size, validation_size=validation_size, **kwargs
        )


@dataclass
class ModelMetadata:
    name: str
    user_id: str
    dataset: Dataset
    options: TrainingOptions
    status: TrainingStatus = TrainingStatus.WAITING

    @staticmethod
    def from_dict(dict: Dict[str, Any]) -> "ModelMetadata":
        # Convert from JS lowerCamelCase to snake case
        dict = humps.decamelize(dict)
        return ModelMetadata(
            name=dict["name"],
            user_id=dict["user_id"],
            dataset=Dataset.from_dict(dict["dataset"]),
            options=TrainingOptions.from_dict(dict["options"]),
            status=TrainingStatus(dict["training_status"]),
        )
