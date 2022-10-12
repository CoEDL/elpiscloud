from models import Annotation
from pytest import raises

START = 0
STOP = 1000
AUDIO_FILE_NAME = "audio"
TRANSCRIPT = "hi"
SPEAKER_ID = "goofy"

INVALID_ANNOTATION_DATA = {"audio_file_name": AUDIO_FILE_NAME}
UNTIMED_ANNOTATION_DATA = {
    "audio_file_name": AUDIO_FILE_NAME,
    "transcript": TRANSCRIPT,
    "speaker_id": SPEAKER_ID,
}
TIMING_DATA = {"start_ms": START, "stop_ms": STOP}
TIMED_ANNOTATION_DATA = UNTIMED_ANNOTATION_DATA | TIMING_DATA


def test_annotation_from_valid_dict():
    annotation = Annotation.from_dict(UNTIMED_ANNOTATION_DATA)
    assert annotation.audio_file_name == AUDIO_FILE_NAME
    assert annotation.transcript == TRANSCRIPT

    annotation = Annotation.from_dict(TIMED_ANNOTATION_DATA)
    assert annotation.start_ms == START
    assert annotation.stop_ms == STOP


def test_annotation_from_invalid_dict():
    with raises(Exception):
        Annotation.from_dict(INVALID_ANNOTATION_DATA)


def test_to_dict_round_trip():
    timed_annotation = Annotation.from_dict(TIMED_ANNOTATION_DATA)
    assert timed_annotation.to_dict() == TIMED_ANNOTATION_DATA


def test_is_timed():
    timed_annotation = Annotation.from_dict(TIMED_ANNOTATION_DATA)
    assert timed_annotation.is_timed()

    untimed_annotation = Annotation.from_dict(UNTIMED_ANNOTATION_DATA)
    assert not untimed_annotation.is_timed()
