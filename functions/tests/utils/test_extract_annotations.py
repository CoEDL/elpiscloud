from pathlib import Path

from utils.extract_annotations import (
    get_annotations_by_tier_name,
    get_annotations_by_tier_order,
    get_annotations_by_tier_type,
)

DATA_DIR = Path(__file__).parent.parent / "data"
ELAN_PATH = DATA_DIR / "test.eaf"


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
