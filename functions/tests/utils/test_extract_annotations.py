from pathlib import Path
from unittest.mock import Mock

from models.dataset import ElanOptions
from models.elan_tier_selector import TierSelector
from utils.extract_annotations import (
    extract_annotations,
    extract_elan_annotations,
    extract_text_annotations,
    get_annotations_by_tier_name,
    get_annotations_by_tier_order,
    get_annotations_by_tier_type,
)

DATA_DIR = Path(__file__).parent.parent / "data"
ELAN_PATH = DATA_DIR / "test.eaf"


def test_extract_annotations_from_text_calls_proper_function(mocker):
    path = Path("text.txt")
    extract_text_mock: Mock = mocker.patch(
        "utils.extract_annotations.extract_text_annotations"
    )
    extract_annotations(path)
    extract_text_mock.assert_called_once_with(path)


def test_extract_annotations_from_elan_without_elan_options():
    path = Path("text.eaf")
    annotations = extract_annotations(path)
    assert len(annotations) == 0


def test_extract_annotations_from_elan_with_elan_options(mocker):
    elan_options = ElanOptions(
        selection_value="Phrase", selection_mechanism=TierSelector.NAME
    )
    path = Path("text.eaf")
    mock: Mock = mocker.patch("utils.extract_annotations.extract_elan_annotations")

    extract_annotations(path, elan_options)
    mock.assert_called_once_with(
        path,
        selection_type=elan_options.selection_mechanism,
        selection_data=elan_options.selection_value,
    )


def test_extract_annotations_from_unknown_file_format():
    path = Path("text.ipub")
    annotations = extract_annotations(path)
    assert len(annotations) == 0


def test_extract_text_annotations(tmp_path: Path):
    text = "hello"
    path = tmp_path / "test.txt"
    with open(path, "w") as f:
        f.write(text)

    annotations = extract_text_annotations(path)
    assert len(annotations) == 1
    annotation = annotations[0]
    assert annotation.transcript == text
    assert annotation.audio_file_name == path.stem + ".wav"


def test_extract_elan_annotations(mocker):
    path = Path()
    selector = TierSelector.NAME
    value = "Phrase"
    name_mock: Mock = mocker.patch(
        "utils.extract_annotations.get_annotations_by_tier_name"
    )
    extract_elan_annotations(path, selector, value)
    name_mock.assert_called_once_with(path, value)

    # Linguistic type
    selector = TierSelector.TYPE
    type_mock: Mock = mocker.patch(
        "utils.extract_annotations.get_annotations_by_tier_type"
    )
    extract_elan_annotations(path, selector, value)
    type_mock.assert_called_once_with(path, value)

    # Tier Order
    selector = TierSelector.ORDER
    order_mock: Mock = mocker.patch(
        "utils.extract_annotations.get_annotations_by_tier_order"
    )
    extract_elan_annotations(path, selector, value)
    # Default if can't convert value to number
    order_mock.assert_called_with(path, 1)

    value = "2"
    extract_elan_annotations(path, selector, value)
    order_mock.assert_called_with(path, 2)


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
