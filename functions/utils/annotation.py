from dataclasses import dataclass
from enum import Enum
from itertools import chain
from pathlib import Path
from typing import Any, Dict, List, Optional, Tuple

from loguru import logger
from pympi.Elan import Eaf


@dataclass
class Annotation:
    """A class which represents a section of speech for a given audio file and
    sample rate. If start_ms and end_ms arent specified, it is assumed that the
    Annotation spans the entire audio file.
    """

    audio_file_name: str
    transcript: str
    start_ms: Optional[int] = None
    stop_ms: Optional[int] = None
    speaker_id: Optional[str] = None

    def rescale_times(self, old_sample_rate: int, sample_rate: int) -> "Annotation":
        """Creates a new annotation, with a modified start_ms and end_ms to fit
        the transcript under the new sample_rate.

        Parameters:
            old_sample_rate: The old sample rate of the annotation.
            sample_rate: The new sample rate of the annotation.

        Returns:
            The modified annotation.
        """
        if self.start_ms is None or self.stop_ms is None:
            start_ms = None
            stop_ms = None
        else:
            scale = old_sample_rate / sample_rate
            # Make sure to always contain transcript
            start_ms = int(self.start_ms * scale)
            stop_ms = int(self.stop_ms * scale) + 1

        return Annotation(
            audio_file_name=self.audio_file_name,
            transcript=self.transcript,
            start_ms=start_ms,
            stop_ms=stop_ms,
        )

    def to_dict(self) -> Dict[str, Any]:
        """Converts an annotation to a serializable dictionary"""
        return dict(self.__dict__)

    @staticmethod
    def from_dict(data: Dict[str, Any]) -> "Annotation":
        """Builds an annotation from a serializable dictionary

        Throws an error if the required keys are not found.
        """
        return Annotation(
            audio_file_name=data["audio_file_name"],
            transcript=data["transcript"],
            start_ms=data.get("start_ms"),
            stop_ms=data.get("stop_ms"),
            speaker_id=data.get("speaker_id"),
        )


class TierSelector(Enum):
    ORDER = "tier_order"
    TYPE = "tier_type"
    NAME = "tier_name"


def process_eaf(
    elan_file_path: Path, selection_type: TierSelector, selection_data: str
) -> List[Annotation]:
    """Extracts annotations from a particular tier in an eaf file (ELAN
    Annotation Format).

    Tiers are nodes from the tree structure in the .eaf file.
    The tier to read from is determined by tier order (eg top tier would be order 1),
    tier type (eg default-lt) or tier name (eg Phrase).

    Parameters:
        elan_file_path: The path to the eaf file.
        selection_type: The method of determining which tier data to extract.
        selection_data: The data corresponding to the selection_type.

    Returns:
        A list of the annotations contained for the supplied data. Returns an
        empty list if the given selection isn't found.
    """
    logger.info(
        f"processing eaf {elan_file_path} using {selection_type}: {selection_data}"
    )

    match selection_type:
        case TierSelector.NAME:
            return get_annotations_by_tier_name(elan_file_path, selection_data)
        case TierSelector.TYPE:
            return get_annotations_by_tier_type(elan_file_path, selection_data)
        case TierSelector.ORDER:
            try:
                order = int(selection_data)
            except:
                order = 1
            return get_annotations_by_tier_order(elan_file_path, order)


def get_annotations_by_tier_order(
    elan_file_path: Path, tier_order: int
) -> List[Annotation]:
    """Retrieves all annotations for a given tier order within an eaf file.

    Parameters:
        elan_file_path: The path to the eaf file.
        tier_order: The tier order to extract from (starts at 1)

    Returns:
        A list of the annotations contained for the supplied tier order.
        Returns an empty list if the given tier order exceeds the nesting of
        the file.
    """
    elan = Eaf(elan_file_path)

    tier_names: List[str] = list(elan.get_tier_names())
    if tier_order > len(tier_names):
        logger.error(
            f"tier_order: {tier_order} exceeds tier length for {elan_file_path}"
        )
        return []

    tier_name = tier_names[tier_order - 1]
    return get_annotations_by_tier_name(
        elan_file_path=elan_file_path, tier_name=tier_name
    )


def get_annotations_by_tier_type(
    elan_file_path: Path, tier_type: str
) -> List[Annotation]:
    """Retrieves all annotations for a given linguistic tier type in an eaf file.

    Parameters:
        elan_file_path: The path to the eaf file.
        tier_type: The linguistic type from which to extract Annotation data.

    Returns:
        A list of the annotations contained for the supplied linguistic type.
        Returns an empty list if the type is not found.
    """
    elan = Eaf(elan_file_path)

    if tier_type not in list(elan.get_linguistic_type_names()):
        logger.error(f"tier_type: {tier_type} not found in file: {elan_file_path}")
        return []

    tier_names = elan.get_tier_ids_for_linguistic_type(tier_type)
    annotations = (
        get_annotations_by_tier_name(elan_file_path, name) for name in tier_names
    )
    # Flatten list of annotations
    return list(chain(*annotations))


def get_annotations_by_tier_name(
    elan_file_path: Path, tier_name: str
) -> List[Annotation]:
    """Retrieves all annotations for a given tier name in an eaf file.

    Parameters:
        elan_file_path: The path to the eaf file.
        tier_name: The tier name from which to extract Annotation data.

    Returns:
        A list of the annotations contained for the supplied tier name.
        Returns an empty list if the name is not found.
    """
    elan = Eaf(elan_file_path)

    if tier_name not in list(elan.get_tier_names()):
        logger.error(f"tier_name: {tier_name} not found in file {elan_file_path}")
        return []

    parameters: Dict[str, str] = elan.get_parameters_for_tier(tier_name)
    speaker_id = parameters.get("PARTICIPANT", None)

    def create_annotation(elan_annotation: Tuple[str, str, str]) -> Annotation:
        start, end, transcript = elan_annotation
        return Annotation(
            audio_file_name=f"{elan_file_path.stem}.wav",
            transcript=transcript,
            start_ms=int(start),
            stop_ms=int(end),
            speaker_id=speaker_id,
        )

    return list(map(create_annotation, elan.get_annotation_data_for_tier(tier_name)))
