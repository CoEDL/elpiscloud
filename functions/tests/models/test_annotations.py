from models import Annotation
from pytest import raises

VALID_ANNOTATION_DATA = {"audio_file_name": "audio", "transcript": "hi there"}
INVALID_ANNOTATION_DATA = {"audio_file_name": "audio"}


def test_annotation_from_valid_dict():
    a = Annotation.from_dict(VALID_ANNOTATION_DATA)
    assert a.audio_file_name == "audio"
    assert a.transcript == "hi there"


def test_annotation_from_invalid_dict():
    with raises(Exception):
        Annotation.from_dict(INVALID_ANNOTATION_DATA)
