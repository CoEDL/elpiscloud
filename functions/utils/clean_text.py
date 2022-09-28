import re

from models import DatasetOptions


def clean_text(text: str, options: DatasetOptions) -> str:
    """Cleans the text based on the supplied options.

    Parameters:
        text: The text to clean.
        options: The cleaning options.

    Returns:
        The cleaned text
    """
    words = text.lower().split()
    words = filter(lambda word: word not in options.text_to_remove, words)

    if options.punctuation_to_explode != "":
        words = map(lambda word: explode(word, options.punctuation_to_explode), words)

    if options.punctuation_to_remove != "":
        words = map(lambda word: collapse(word, options.punctuation_to_remove), words)

    result = " ".join(words).strip()
    return remove_consecutive_spaces(result)


def explode(text: str, pattern: str) -> str:
    """Replace occurences of the pattern with spaces within the given text.

    Parameters:
        text: The text to modify.
        pattern: The pattern of characters to replace with spaces.

    Returns:
        The text with instances of the pattern exploded.
    """
    pattern = re.escape(pattern)
    return re.sub(rf"[{pattern}]", " ", text)


def collapse(text: str, pattern: str) -> str:
    """Remove occurences of the pattern within the given text.

    Parameters:
        text: The text to modify.
        pattern: The pattern of characters to remove.

    Returns:
        The text with instances of the pattern removed.
    """
    pattern = re.escape(pattern)
    return re.sub(rf"[{pattern}]", "", text)


def remove_consecutive_spaces(text: str) -> str:
    """Replace consecutive spaces with a single one in some given text.

    Parameters:
        text: The text to modify.

    Returns
        The supplied text with conseucutive spaces reduced to one.
    """
    return re.sub("[ ]+", " ", text)
