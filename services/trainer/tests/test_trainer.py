import os
import shutil
from pathlib import Path

from pytest import mark
from trainer.model_metadata import ModelMetadata, TrainingOptions
from trainer.trainer import train

DATA_PATH = (Path(__file__).parent / "data").resolve()
DATASET_PATH = DATA_PATH / "dataset"

METADATA = ModelMetadata(
    model_name="test",
    dataset_name="test",
    user_id="0",
    options=TrainingOptions(epochs=1, max_duration=10),
)


@mark.integration
def test_training(tmp_path: Path):
    dataset_path = tmp_path / "dataset"
    dataset_path.mkdir(exist_ok=True, parents=True)

    for file in os.listdir(DATASET_PATH):
        shutil.copy(DATASET_PATH / file, dataset_path)

    model_path = train(METADATA, tmp_path, dataset_path)
