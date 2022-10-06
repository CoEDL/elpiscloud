from pathlib import Path
from typing import List

from transcriber.utterance import Utterance
from transformers import AutoModelForCTC, AutoProcessor, Pipeline, pipeline

CACHE_DIR = Path("/tmp")
TASK = "automatic_speech_recognition"


def build_pipeline(pretrained_location: str, cache_dir: Path = CACHE_DIR) -> Pipeline:
    """Builds the pipeline from the supplied pretrained location.

    Parameters:
        pretrained_location: A huggingface model name, or local path to the
            pretrained model.
        cache_dir: The directory in which to store temporary files.

    Returns:
        A pipeline to be used for asr.
    """
    model = AutoModelForCTC.from_pretrained(pretrained_location, cache_dir=cache_dir)
    processor = AutoProcessor.from_pretrained(pretrained_location, cache_dir=cache_dir)

    return pipeline(task=TASK, model=model, processor=processor)


def transcribe(audio: Path, pipeline: Pipeline) -> List[Utterance]:
    ...
