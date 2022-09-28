from dataclasses import dataclass
from typing import Any, Dict, Optional


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
