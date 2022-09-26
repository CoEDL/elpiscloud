from dataclasses import dataclass
from pathlib import Path
from typing import Any, Dict, Optional


@dataclass
class Utterance:
    audio_file_name: str
    transcript: str
    start_ms: Optional[int]
    stop_ms: Optional[int]
    speaker_id: Optional[str]

    def combine(self, utterance: "Utterance") -> "Utterance":
        return Utterance(
            audio_file_name=self.audio_file_name,
            transcript=f"{self.transcript} {utterance.transcript}",
            start_ms=self.start_ms,
            stop_ms=utterance.stop_ms,
            speaker_id=self.speaker_id,
        )

    def to_dict(self, audio_folder: Path):
        return {
            "audio": str((audio_folder / self.audio_file_name).absolute()),
            "transcription": self.transcript,
        }

    @staticmethod
    def from_dict(dict: Dict[str, Any]) -> "Utterance":
        return Utterance(
            audio_file_name=dict["audio_file_name"],
            transcript=dict["transcript"],
            start_ms=dict.get("start_ms"),
            stop_ms=dict.get("stop_ms"),
            speaker_id=dict.get("speaker_id"),
        )
