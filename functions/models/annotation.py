from copy import copy
from dataclasses import dataclass
from typing import Any, Dict, Optional


@dataclass
class Annotation:
    """A class which represents a section of speech for a given audio file and
    sample rate. If start_ms and end_ms aren't specified, it is assumed that the
    Annotation spans the entire audio file.
    """

    audio_file_name: str
    transcript: str
    speaker_id: Optional[str] = None  # Currently unused
    start_ms: Optional[int] = None
    stop_ms: Optional[int] = None
    sample_rate: Optional[int] = None

    def is_timed(self) -> bool:
        return (
            self.sample_rate is not None
            and self.start_ms is not None
            and self.stop_ms is not None
        )

    def rescale_timestamps(self, sample_rate: int) -> "Annotation":
        """Creates a new annotation, with a modified start_ms and end_ms to fit
        the transcript under the new sample_rate.

        Parameters:
            old_sample_rate: The old sample rate of the annotation.
            sample_rate: The new sample rate of the annotation.

        Returns:
            The modified annotation.
        """
        result = copy(self)
        if not self.is_timed():
            return result

        scale = self.sample_rate / sample_rate  # type: ignore
        # Make sure to always contain transcript
        result.start_ms = int(self.start_ms * scale)
        result.stop_ms = int(self.stop_ms * scale) + 1
        return result

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
            sample_rate=data.get("sample_rate"),
            speaker_id=data.get("speaker_id"),
        )
