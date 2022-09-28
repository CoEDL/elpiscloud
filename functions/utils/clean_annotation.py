from models import Annotation, DatasetOptions


def clean_annotation(annotation: Annotation, options: DatasetOptions) -> Annotation:
    dirty_words = annotation.transcript.lower().split()
    ...


def explode(text: str, pattern: str) -> str:
    ...


def collapse(text: str, pattern: str) -> str:
    ...
