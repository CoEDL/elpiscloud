import os
from pathlib import Path
from typing import Dict, List, Tuple

from pympi.Elan import Eaf


def process_eaf(
    input_elan_file: Path,
    tier_order: int = 0,
    tier_type: str = "",
    tier_name: str = "",
) -> List[Dict[str, str]]:
    """
    Processes a particular tier in an eaf file (ELAN Annotation Format).
    Transcriptions are read from an elan file tier.

    Tiers are nodes from the tree structure in the .eaf file.
    The tier to read from is determined by tier order (eg top tier would be order 1),
    tier type (eg default-lt) or tier name (eg Phrase).
    If tier type is used, the first tier matching this type is used.
    Elan can have multiple tiers of same type, future work would support reading data
    from multiple tiers of the selected type.

    It stores the transcriptions in the following format:
                    {'speaker_id': <speaker_id>,
                    'audio_file_name': <file_name>,
                    'transcript': <transcription_label>,
                    'start_ms': <start_time_in_milliseconds>,
                    'stop_ms': <stop_time_in_milliseconds>}

    :param input_elan_file: name of input elan file
    :param tier_order: index of the elan tier to process
    :param tier_type:  type of the elan tier to process
    :param tier_name:  name of the elan tier to process
    :param corpus_tiers_file list of all
    :return: a list of dictionaries, where each dictionary is an annotation

    TODO Change to google styling.
    """

    print(
        f"processing eaf {input_elan_file} using {tier_order} {tier_type} {tier_name}"
    )

    # Get tier data from Elan file
    input_eaf = Eaf(input_elan_file)
    tier_types: List[str] = list(input_eaf.get_linguistic_type_names())
    tier_names: List[str] = list(input_eaf.get_tier_names())

    # Get annotations and parameters (things like speaker id) on the target tier
    annotations: List[Tuple[str, str, str]] = []
    annotations_data: List[dict] = []

    # First try using tier order to get tier name
    if tier_order:
        # Watch out for files that may not have this many tiers
        # tier_order is 1-index but List indexing is 0-index
        try:
            tier_name = tier_names[tier_order - 1]
            print(f"using tier order {tier_order} to get tier name {tier_name}")
        except IndexError:
            print("Couldn't find a tier")
            pass
    else:
        # else use tier type to get a tier name
        if tier_type in tier_types:
            print(f"found tier type {tier_type}")
            tier_names = input_eaf.get_tier_ids_for_linguistic_type(tier_type)
            tier_name = tier_names[0]
            if tier_name:
                print(f"found tier name {tier_name}")
        else:
            print("tier type not found in this file")

    if tier_name in tier_names:
        print(f"using tier name {tier_name}")
        annotations = input_eaf.get_annotation_data_for_tier(tier_name)

    if annotations:
        print(f"annotations {annotations}")
        annotations = sorted(annotations)
        parameters: Dict[str, str] = input_eaf.get_parameters_for_tier(tier_name)
        print(f"parameters {parameters}")
        speaker_id: str = parameters.get("PARTICIPANT", "")

    for annotation in annotations:
        start: str = annotation[0]
        end: str = annotation[1]
        annotation_text: str = annotation[2]

        print(f"annotation {annotation} {start} {end}")
        obj = {
            "audio_file_name": f"{input_elan_file.stem}.wav",
            "transcript": annotation_text,
            "start_ms": start,
            "stop_ms": end,
        }
        if "PARTICIPANT" in parameters:
            obj["speaker_id"] = speaker_id
        annotations_data.append(obj)

    return annotations_data
