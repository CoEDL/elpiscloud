from dataclasses import dataclass


@dataclass
class Utterance:
    transcript: str
    start_ms: int
    end_ms: int
