from dataclasses import dataclass, fields
from enum import Enum
from typing import Any, Dict

from humps.main import decamelize
from utils.firestore_event_converter import unpack

BASE_MODEL = "facebook/wav2vec2-base-960h"
SAMPLING_RATE = 16_000


class TrainingStatus(Enum):
    WAITING = "waiting"
    TRAINING = "training"
    FINISHED = "finished"
    ERROR = "error"


@dataclass
class TrainingOptions:
    batch_size: int = 4
    epochs: int = 2
    learning_rate: float = 1e-4
    min_duration: int = 0
    max_duration: int = 60
    word_delimiter_token: str = " "
    test_size: float = 0.2

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "TrainingOptions":
        field_names = [field.name for field in fields(TrainingOptions)]
        kwargs = {key: data[key] for key in data if key in field_names}
        return cls(**kwargs)

    def to_dict(self) -> Dict[str, Any]:
        return dict(self.__dict__)


@dataclass
class Model:
    model_name: str
    dataset_name: str
    user_id: str
    options: TrainingOptions
    status: TrainingStatus = TrainingStatus.WAITING
    base_model: str = BASE_MODEL
    sampling_rate: int = SAMPLING_RATE

    @classmethod
    def from_firestore_event(cls, data: Dict[str, Any]) -> "Model":
        """Generates a metadata class from a google firestore event dictionary
        representing changes to a model within firestore.
        """
        # Unpack value dictionary and convert to snake case
        data = decamelize(unpack(data))
        return cls(
            model_name=data["model_name"],
            dataset_name=data["dataset_name"],
            user_id=data["user_id"],
            options=TrainingOptions.from_dict(data["options"]),
            status=TrainingStatus(data["status"]),
            base_model=data.get("base_model", BASE_MODEL),
            sampling_rate=data.get("sampling_rate", SAMPLING_RATE),
        )

    def to_dict(self) -> Dict[str, Any]:
        result = dict(self.__dict__)
        result["options"] = self.options.to_dict()
        result["status"] = self.status.value
        return result
