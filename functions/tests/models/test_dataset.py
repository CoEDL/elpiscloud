from models import Dataset, DatasetOptions, ElanOptions, TierSelector
from pytest import raises

# ====== Elan Options ======

VALID_ELAN_OPTIONS_DICT = {
    "selection_mechanism": "tier_name",
    "selection_value": "test",
}
INVALID_ELAN_OPTIONS_DICT = {
    "selection_mechanism": "pier_name",
    "selection_value": "jest",
}


def test_build_elan_options():
    options = ElanOptions.from_dict(VALID_ELAN_OPTIONS_DICT)
    assert options.selection_mechanism == TierSelector.NAME
    assert options.selection_value == "test"


def test_build_invalid_elan_options_raises_error():
    with raises(ValueError):
        ElanOptions.from_dict(INVALID_ELAN_OPTIONS_DICT)


def test_serialize_elan_options():
    options = ElanOptions(
        selection_mechanism=TierSelector.NAME, selection_value="hello"
    )
    result = options.to_dict()
    assert result["selection_mechanism"] == "tier_name"
    assert result["selection_value"] == "hello"


# ====== Dataset Options ======
VALID_DATASET_OPTIONS_WITHOUT_ELAN_DICT = {
    "punctuation_to_remove": ":",
    "punctuation_to_replace": ";",
    "tags_to_remove": "<UNK>",
    "words_to_remove": "hello",
}

VALID_DATASET_OPTIONS_DICT = VALID_DATASET_OPTIONS_WITHOUT_ELAN_DICT | {
    "elan_options": VALID_ELAN_OPTIONS_DICT
}


def test_default_dataset_options():
    options = DatasetOptions()
    assert options.punctuation_to_remove == ""
    assert options.punctuation_to_replace == ""
    assert options.tags_to_remove == ""
    assert options.words_to_remove == ""
    assert options.elan_options is None


def test_build_dataset_options_with_elan():
    options = DatasetOptions.from_dict(VALID_DATASET_OPTIONS_DICT)
    assert options.punctuation_to_remove == ":"
    assert options.punctuation_to_replace == ";"
    assert options.tags_to_remove == "<UNK>"
    assert options.words_to_remove == "hello"
    assert options.elan_options is not None
    assert options.elan_options == ElanOptions.from_dict(VALID_ELAN_OPTIONS_DICT)


def test_build_dataset_options_without_elan():
    options = DatasetOptions.from_dict(VALID_DATASET_OPTIONS_WITHOUT_ELAN_DICT)
    assert options.punctuation_to_remove == ":"
    assert options.punctuation_to_replace == ";"
    assert options.tags_to_remove == "<UNK>"
    assert options.words_to_remove == "hello"
    assert options.elan_options is None


def test_serialize_dataset_options():
    options = DatasetOptions(
        punctuation_to_remove=":",
        punctuation_to_replace=";",
        tags_to_remove="<UNK>",
        words_to_remove="hello",
        elan_options=ElanOptions.from_dict(VALID_ELAN_OPTIONS_DICT),
    )
    assert options.to_dict() == VALID_DATASET_OPTIONS_DICT


# ======  Dataset ======
FILES_WITH_ELAN = ["1.eaf", "1.wav"]
FILES_WITHOUT_ELAN = ["1.txt", "1.wav"]
MISMATCHED_FILES = ["1.eaf", "1.wav", "2.wav", "3.txt"]
COLLIDING_FILES = ["1.eaf", "1.wav", "1.txt"]


VALID_DATASET_DICT = {
    "name": "dataset",
    "user_id": "1",
    "files": FILES_WITH_ELAN,
    "options": VALID_DATASET_OPTIONS_DICT,
    "processed": False,
}


def test_build_dataset():
    dataset = Dataset.from_dict(VALID_DATASET_DICT)
    assert dataset.name == "dataset"
    assert dataset.user_id == "1"
    assert dataset.files == FILES_WITH_ELAN
    assert dataset.options == DatasetOptions.from_dict(VALID_DATASET_OPTIONS_DICT)
    assert dataset.processed == False


def test_serialize_dataset():
    dataset = Dataset.from_dict(VALID_DATASET_DICT)
    assert dataset.to_dict() == VALID_DATASET_DICT


def test_dataset_is_empty():
    dataset = Dataset.from_dict(VALID_DATASET_DICT)
    assert not dataset.is_empty()

    dataset.files = []
    assert dataset.is_empty()


def test_dataset_has_elan():
    dataset = Dataset.from_dict(VALID_DATASET_DICT)
    assert dataset.has_elan()

    dataset.files = FILES_WITHOUT_ELAN
    assert not dataset.has_elan()


def test_dataset_mismatched_files():
    dataset = Dataset.from_dict(VALID_DATASET_DICT)
    assert len(dataset.mismatched_files()) == 0

    dataset.files = MISMATCHED_FILES
    assert set(dataset.mismatched_files()) == {"2.wav", "3.txt"}


def test_duplicate_files():
    dataset = Dataset.from_dict(VALID_DATASET_DICT)
    assert len(dataset.colliding_files()) == 0

    dataset.files = COLLIDING_FILES
    assert set(dataset.colliding_files()) == {"1.eaf", "1.txt"}
