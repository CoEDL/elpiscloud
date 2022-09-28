from models import DatasetOptions
from utils.clean_text import clean_text, collapse, explode, remove_consecutive_spaces


def test_explode():
    text = "I commit;ted arson"
    assert explode(text, ";") == "I commit ted arson"

    text = ":::"
    assert explode(text, ":") == (" " * len(text))


def test_collapse():
    text = "uwu"
    assert collapse(text, "u") == "w"

    text = ";"
    assert collapse(text, ";") == ""


def test_remove_consecutive_spaces():
    text = "hey   there "
    assert remove_consecutive_spaces(text) == "hey there "


def test_clean_text_with_defaults_leaves_text_unchanged():
    text = "unchanged"
    assert clean_text(text, DatasetOptions()) == text


def test_clean_text():
    text = "This;is   going -to;-;be very inter-esting"
    cleaning_options = DatasetOptions(
        text_to_remove=["very"], punctuation_to_explode=";", punctuation_to_remove="-"
    )
    expected = "This is going to be interesting".lower()
    assert clean_text(text, cleaning_options) == expected
