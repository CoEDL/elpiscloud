from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict


@dataclass
class Utterance:
    """A class which models an Utterance in an audio file.

    It is assumed that the utterance length spans the entire audio file.
    """

    audio_file_name: str
    transcript: str

    def combine(self, utterance: "Utterance") -> "Utterance":
        """Combines two Utterances into one.

        Parameters:
            utterance: An utterance which occurs after the current instance.

        Returns:
            A single utterance, combining both transcripts.
        """
        return Utterance(
            audio_file_name=self.audio_file_name,
            transcript=f"{self.transcript} {utterance.transcript}",
        )

    def to_dict(self, audio_folder: Path) -> Dict[str, str]:
        """Converts this utterance to a dictonary.

        Parameters:
            The path containing the audio file referenced by this utterance.

        Returns:
            A dictonary containing data about this utterance.
        """
        return {
            "audio": str((audio_folder / self.audio_file_name).absolute()),
            "transcription": self.transcript,
        }

    @staticmethod
    def from_dict(dict: Dict[str, Any]) -> "Utterance":
        """Generates an Utterance from a dictionary"""
        return Utterance(
            audio_file_name=dict["audio_file_name"],
            transcript=dict["transcript"],
        )
