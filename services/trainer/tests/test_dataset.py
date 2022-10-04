import os
import shutil
from pathlib import Path

from trainer.dataset import create_dataset
from trainer.model_metadata import ModelMetadata, TrainingOptions

DATA_PATH = (Path(__file__).parent / "data").resolve()
DATASET_PATH = DATA_PATH / "dataset"

METADATA = ModelMetadata(
    model_name="test",
    dataset_name="test",
    user_id="0",
    options=TrainingOptions(epochs=1, max_duration=10),
)


def test_create_dataset(tmp_path: Path):
    for file in os.listdir(DATASET_PATH):
        shutil.copy(DATASET_PATH / file, tmp_path)

    result = create_dataset(METADATA, tmp_path, tmp_path / "cache")
    assert "test" in result
    assert "train" in result
