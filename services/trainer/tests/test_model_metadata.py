import json
from pathlib import Path

import pytest
from trainer.model_metadata import BASE_MODEL, ModelMetadata

DATA_PATH = (Path(__file__).parent / "data").resolve()
VALID_METADATA = Path(DATA_PATH, "valid_model_metadata.json")
INVALID_METADATA = Path(DATA_PATH, "invalid_model_metadata.json")


def test_valid_conversion():
    with open(VALID_METADATA) as metadata_file:
        metadata = json.load(metadata_file)

    result = ModelMetadata.from_dict(metadata)
    assert result.base_model == BASE_MODEL


def test_invalid_metadata_raises_exception():
    with open(INVALID_METADATA) as metadata_file:
        metadata = json.load(metadata_file)

    with pytest.raises(Exception):
        ModelMetadata.from_dict(metadata)
