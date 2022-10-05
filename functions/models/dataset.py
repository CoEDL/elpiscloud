from dataclasses import dataclass, field, fields
from pathlib import Path
from typing import Any, Dict, List, Optional, Set

from models.elan_tier_selector import TierSelector

TRANSCRIPTION_EXTENSIONS = {".eaf", ".txt"}


@dataclass
class ElanOptions:
    """A class representing options for how to extract utterance information
    from an elan file."""

    selection_mechanism: TierSelector
    selection_value: str

    @classmethod
    def from_dict(cls, data: Dict[str, str]) -> "ElanOptions":
        return cls(
            selection_mechanism=TierSelector(data["selection_mechanism"]),
            selection_value=data["selection_value"],
        )

    def to_dict(self) -> Dict[str, str]:
        result = dict(self.__dict__)
        result["selection_mechanism"] = self.selection_mechanism.value
        return result


@dataclass
class DatasetOptions:
    """A class representing processing options for a dataset."""

    punctuation_to_remove: str = ""
    punctuation_to_explode: str = ""
    text_to_remove: List[str] = field(default_factory=list)
    elan_options: Optional[ElanOptions] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "DatasetOptions":
        kwargs = {
            field.name: data[field.name]
            for field in fields(DatasetOptions)
            if field.name != "elan_options"
        }

        if "elan_options" in data:
            elan_options = ElanOptions.from_dict(data["elan_options"])
        else:
            elan_options = None

        return cls(elan_options=elan_options, **kwargs)

    def to_dict(self) -> Dict[str, Any]:
        result = dict(self.__dict__)
        if self.elan_options is not None:
            result["elan_options"] = self.elan_options.to_dict()
        return result


@dataclass
class ProcessingJob:
    """A class encapsulating the data needed for an individual processing job"""

    user_id: str
    transcription_file_name: str
    audio_file_name: str
    dataset_name: str
    options: DatasetOptions

    def to_dict(self) -> Dict[str, Any]:
        result = dict(self.__dict__)
        result["options"] = self.options.to_dict()
        return result

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ProcessingJob":
        kwargs = {
            field.name: data[field.name]
            for field in fields(ProcessingJob)
            if field.name != "options"
        }
        options = DatasetOptions.from_dict(data["options"])
        return cls(options=options, **kwargs)


@dataclass
class Dataset:
    """A class representing an unprocessed dataset within firestore."""

    name: str
    user_id: str
    files: List[str]
    options: DatasetOptions
    processed: bool

    def is_empty(self) -> bool:
        """Returns true iff the dataset contains no files."""
        return len(self.files) == 0

    def has_elan(self) -> bool:
        """Returns true iff any of the files in the dataset is an elan file."""
        return any(map((lambda file_name: file_name.endswith(".eaf")), self.files))

    def is_valid(self) -> bool:
        """Returns true iff this dataset is valid for processing."""
        return (
            not self.is_empty()
            and len(self.files) % 2 == 0
            and len(self.mismatched_files()) == 0
            and len(self.colliding_files()) == 0
        )

    @staticmethod
    def corresponding_audio_file(transcript_file: str) -> str:
        """Gets the corresponding audio file name for a given transcript file."""
        return Path(transcript_file).stem + ".wav"

    def mismatched_files(self) -> Set[str]:
        """Returns the list of transcript file names with no corresponding
        audio files and vice versa.

        Corresponding in this case means that for every transcript file with
        name x.some_extension, there is a corresponding file x.wav

        Returns:
            A list of the mismatched file names.
        """
        transcripts_with_audio = set(
            filter(
                lambda file: Dataset.corresponding_audio_file(file) in self.files,
                self._transcript_files(),
            )
        )
        matched_files = transcripts_with_audio | set(
            Dataset.corresponding_audio_file(file) for file in transcripts_with_audio
        )

        return set(self.files).difference(matched_files)

    def colliding_files(self) -> Set[str]:
        """Returns the list of transcript file names that collide.

        Collide means that two transcript files would be for the same .wav
        file.

        Returns:
            A list of the colliding file names.
        """

        def would_collide(transcript_file: str) -> bool:
            other_files = self._transcript_files().difference({transcript_file})
            other_file_names = map(lambda file: Path(file).stem, other_files)
            return Path(transcript_file).stem in other_file_names

        return set(filter(would_collide, self._transcript_files()))

    def _transcript_files(self) -> Set[str]:
        """Returns a set of all transcription files within the dataset."""
        return set(
            filter(
                lambda file: Path(file).suffix in TRANSCRIPTION_EXTENSIONS, self.files
            )
        )

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Dataset":
        kwargs = {
            field.name: data[field.name]
            for field in fields(Dataset)
            if field.name != "options"
        }
        options = DatasetOptions.from_dict(data["options"])
        return cls(options=options, **kwargs)

    def to_batch(self) -> List["ProcessingJob"]:
        """Converts a valid dataset to a list of processing jobs, matching
        transcript and audio files.
        """
        return [
            ProcessingJob(
                dataset_name=self.name,
                transcription_file_name=transcription_file_name,
                audio_file_name=self.corresponding_audio_file(transcription_file_name),
                options=self.options,
                user_id=self.user_id,
            )
            for transcription_file_name in self._transcript_files()
        ]

    def to_dict(self) -> Dict[str, Any]:
        result = dict(self.__dict__)
        result["options"] = self.options.to_dict()
        return result
