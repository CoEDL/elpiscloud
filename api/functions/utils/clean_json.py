"""
Given a json file with transcript information these tools can perform
- manipulations including generating word lists or filtering output to
- exclude english/punctuation.
- Optionally provide the output json file name with -j

Copyright: University of Queensland, 2019
Contributors:
              Josh Arnold - (The University of Queensland, 2017)
              Ben Foley - (The University of Queensland, 2018)
              Nicholas Lambourne - (The University of Queensland, 2019)
              Harry Keightley - (The University of Queensland, 2022)
"""

import re
from typing import Dict, List, Set, Tuple


def clean_json_data(
    json_data: List[Dict[str, str]],
    punctuation_to_collapse_by: str = "",
    punctuation_to_explode_by: str = "",
    special_cases: set = {None},
    translation_tags: set = {None},
    remove_english: bool = False,
) -> List[Dict[str, str]]:
    """
    Clean a list of utterances (Python dictionaries) based on the given parameters.
    :param json_data: List of Python dictionaries, each must have a 'transcript' key-value.
    :param punctuation_to_collapse_by: punctuation marks to strip.
    :param punctuation_to_explode_by: punctuation marks to replace with spaces.
    :param special_cases: a list of words to always remove from the output.
    :param translation_tags: a list of tags to always remove from the output.
    :param remove_english: whether or not to remove English from the utterances.
    :param use_langid: whether or not to use the langid library to identify English to remove.
    :return: list of cleaned utterances (dictionaries).
    """
    json_data_cleaned = []
    for utterance in json_data:
        utterance_cleaned = clean_json_utterance(
            utterance,
            punctuation_to_collapse_by=punctuation_to_collapse_by,
            punctuation_to_explode_by=punctuation_to_explode_by,
            special_cases=special_cases,
            translation_tags=translation_tags,
            remove_english=remove_english,
        )
        json_data_cleaned.append(utterance_cleaned)
    return json_data_cleaned


def clean_json_utterance(
    utterance: Dict[str, str],
    punctuation_to_collapse_by: str = "",
    punctuation_to_explode_by: str = "",
    special_cases: set = {None},
    translation_tags: set = {None},
    remove_english: bool = False,
) -> Dict[str, str]:
    """
    Clean an utterance (Python dictionary) based on the given parameters.
    :param utterance: Python dictionary, must have a 'transcript' key-value.
    :param punctuation_to_collapse_by: punctuation marks to strip.
    :param punctuation_to_explode_by: punctuation marks to replace with spaces.
    :param special_cases: a list of words to always remove from the output.
    :param translation_tags: a list of tags to always remove from the output.
    :param remove_english: whether or not to remove English from the utterances.
    :param use_langid: whether or not to use the langid library to identify English to remove.
    :return: cleaned utterance (dictionary).
    """

    # TODO make this an interface setting
    # special_cases = ["<silence>"]  # Any words you want to ignore

    if remove_english:
        english_words = get_english_words()  # pre-load English corpus
    else:
        english_words = set()

    # Clean the text in the dict, returns a list of cleaned words
    clean_words, english_word_count = clean_utterance(
        utterance=utterance,
        punctuation_to_collapse_by=punctuation_to_collapse_by,
        punctuation_to_explode_by=punctuation_to_explode_by,
        special_cases=special_cases,
        translation_tags=translation_tags,
        remove_english=remove_english,
        english_words=english_words,
    )

    # Check that the cleaned words are valid (ie, not null, not English etc)
    if are_words_valid(clean_words, english_word_count, remove_english):
        cleaned_transcript = " ".join(clean_words).strip()
    else:
        # TODO is it best to return an empty str here or raise an error?
        cleaned_transcript = ""

    utterance["transcript"] = cleaned_transcript
    return utterance


def clean_utterance(
    utterance: Dict[str, str],
    punctuation_to_collapse_by: str = "",
    punctuation_to_explode_by: str = "",
    special_cases: set = {None},
    translation_tags: set = {None},
    remove_english: bool = False,
    english_words: set = None,
) -> Tuple[List[str], int]:
    """
    Takes an utterance and cleans it based on the rules established by the provided parameters.
    :param utterance: a dictionary with a "transcript" key-value pair.
    :param punctuation_to_collapse_by: punctuation marks to strip.
    :param punctuation_to_explode_by: punctuation marks to replace with spaces.
    :param special_cases: a list of words to always remove from the output.
    :param translation_tags: a list of tags to always remove from the output.
    :param remove_english: whether or not to remove English words.
    :param english_words: a list of english words to remove from the transcript (we suggest the nltk corpus).
    :return: a tuple with a list of 'cleaned' words and the number of English to remove.
    """
    # TODO add interface setting to include user specific tags
    # translation_tags = {"@eng@", "<ind:", "<eng:"}
    # TODO add interface setting to skip this as caps are significant in some languages
    utterance_string = utterance.get("transcript").lower()
    dirty_words = utterance_string.split()
    clean_words = []
    english_word_count = 0
    for word in dirty_words:
        if word in special_cases:
            continue
        if remove_english and len(word) > 3 and word in english_words:
            english_word_count += 1
            continue
        if word in translation_tags:
            return [], 0
        # Word is ok to use, now clean it
        word = deal_with_punctuation(
            text=word,
            punctuation_to_collapse_by=punctuation_to_collapse_by,
            punctuation_to_explode_by=punctuation_to_explode_by,
        )
        clean_words.append(word)
    return clean_words, english_word_count


def get_english_words() -> Set[str]:
    """ """
    return set()


def are_words_valid(
    clean_words: List[str],
    english_word_count: int,
    remove_english: bool,
) -> bool:
    """
    Determines whether a list of words is valid based on the provided parameters.

    Parameters:
        clean_words (List<str>): a list of clean word strings.
        english_word_count (int): the number of english words removed from the string during cleaning.
        remove_english (boolean): whether or not to remove english words.
        use_langid (boolean): whether or not to use the langid library to determine if a word is English.

    Returns:
        (boolean): True iff utterance is valid.
    """
    # Exclude utterance if empty after cleaning
    cleaned_transcription = " ".join(clean_words).strip()
    if cleaned_transcription == "":
        return False

    # Exclude utterance if > 10% english
    if (
        remove_english
        and len(clean_words) > 0
        and english_word_count / len(clean_words) > 0.1
    ):
        return False

    return True


def deal_with_punctuation(
    text: str = "",
    punctuation_to_collapse_by: str = "",
    punctuation_to_explode_by: str = "",
) -> str:
    """
    Removes punctuation from a string
    :param text: original text
    :param punctuation_to_collapse_by: punctuation marks to strip
    :param punctuation_to_explode_by: punctuation marks to replace with spaces
    :return: cleaned text
    """
    new_text: str = text
    # Prioritise exploding first, these are punctuation marks that the user sets
    if punctuation_to_explode_by:
        pattern_to_explode_by = re.escape(punctuation_to_explode_by)
        new_text = re.sub(rf"[{pattern_to_explode_by}]", " ", new_text)
    # Then strip the rest
    if punctuation_to_collapse_by:
        pattern_to_collapse_by = re.escape(punctuation_to_collapse_by)
        new_text = re.sub(rf"[{pattern_to_collapse_by}]", "", new_text)
    return new_text
