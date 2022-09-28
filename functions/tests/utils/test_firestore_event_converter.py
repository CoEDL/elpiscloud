from utils.firestore_event_converter import unpack

STRING_TEST = {"name": {"stringValue": "test"}}

MAP_TEST = {
    "map": {
        "mapValue": {
            "fields": {"hi": {"stringValue": "there"}, "numba": {"integerValue": 0}}
        }
    },
}

FIELD_TEST = {"fields": {"hi": {"stringValue": "there"}, "numba": {"integerValue": 0}}}


def test_unpack_string():
    result = unpack(STRING_TEST)
    assert result["name"] == "test"


def test_unpack_map():
    result = unpack(MAP_TEST)
    assert result["map"]["hi"] == "there"
    assert result["map"]["numba"] == 0


def test_unpack_fields():
    result = unpack(FIELD_TEST)
    assert result["hi"] == "there"
    assert result["numba"] == 0
