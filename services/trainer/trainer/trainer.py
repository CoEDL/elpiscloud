from pathlib import Path
from typing import Optional
from .model_metadata import ModelMetadata

def train(metadata: ModelMetadata, data_path: Path) -> Optional[Path]:
    ...
