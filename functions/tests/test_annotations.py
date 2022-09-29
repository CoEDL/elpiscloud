from pathlib import Path
from pprint import pprint

from pytest import raises
from utils.annotation import (
    Annotation,
    get_annotations_by_tier_name,
    get_annotations_by_tier_order,
    get_annotations_by_tier_type,
)

VALID_ANNOTATION_DATA = {"audio_file_name": "audio", "transcript": "hi there"}
INVALID_ANNOTATION_DATA = {"audio_file_name": "audio"}

DATA_DIR = Path(__file__).parent / "data"
ELAN_PATH = DATA_DIR / "test.eaf"


def test_annotation_from_valid_dict():
    a = Annotation.from_dict(VALID_ANNOTATION_DATA)
    assert a.audio_file_name == "audio"
    assert a.transcript == "hi there"


def test_annotation_from_invalid_dict():
    with raises(Exception):
        Annotation.from_dict(INVALID_ANNOTATION_DATA)


def test_generate_utterances_from_tier_id():
    annotations = get_annotations_by_tier_name(ELAN_PATH, "Phrase")
    assert len(annotations) == 2
    assert all(annotation.speaker_id == "SL" for annotation in annotations)


def test_missing_linguistic_type():
    annotations = get_annotations_by_tier_type(ELAN_PATH, "missing")
    assert len(annotations) == 0


def test_generate_utterances_from_linguistic_type():
    annotations = get_annotations_by_tier_type(ELAN_PATH, "default-lt")
    assert len(annotations) == 6


def test_invalid_tier_order():
    annotations = get_annotations_by_tier_order(ELAN_PATH, 69)
    assert len(annotations) == 0


def test_generate_utterances_from_tier_order():
    for tier_order in range(1, 4):
        annotations = get_annotations_by_tier_order(ELAN_PATH, tier_order)
        assert len(annotations) == 2
