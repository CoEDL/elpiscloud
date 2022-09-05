import json
import pytest

from pathlib import Path
from trainer.model_metadata import ModelMetadata

DATA_PATH = (Path(__file__).parent / 'data').resolve()

def test_valid_conversion():
    metadata_path = Path(DATA_PATH, 'valid_model_metadata.json')
    with open(metadata_path) as metadata_file:
        metadata = json.load(metadata_file)

    ModelMetadata.from_dict(metadata) 

def test_invalid_metadata_raises_exception():
    metadata_path = Path(DATA_PATH, 'invalid_model_metadata.json')
    with open(metadata_path) as metadata_file:
        metadata = json.load(metadata_file)

    with pytest.raises(Exception):
        ModelMetadata.from_dict(metadata)



