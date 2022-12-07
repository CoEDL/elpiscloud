from __future__ import annotations

from dataclasses import dataclass, fields
from typing import Any, Dict, Iterable

from elpis.datasets import Dataset, ProcessingBatch


@dataclass
class ProcessingJob(ProcessingBatch):
    """A class encapsulating the data needed for an individual processing job"""

    user_id: str
    dataset_name: str

    def to_dict(self) -> Dict[str, Any]:
        result = super().to_dict()
        result["user_id"] = self.user_id
        result["dataset_name"] = self.dataset_name
        return result

    @classmethod
    def from_batch(cls, batch: ProcessingBatch, user_id: str, dataset_name: str):
        return cls(
            user_id=user_id,
            dataset_name=dataset_name,
            **dict((field.name, getattr(batch, field.name)) for field in fields(batch)),
        )

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> ProcessingJob:
        batch = super().from_dict(data)
        return cls.from_batch(
            batch, user_id=data["user_id"], dataset_name=data["dataset_name"]
        )


@dataclass
class CloudDataset(Dataset):
    """A class representing an unprocessed dataset within firestore."""

    user_id: str
    processed: bool

    def to_jobs(self) -> Iterable[ProcessingJob]:
        """Create a list of processing jobs for this cloud dataset."""

        def batch_to_job(batch: ProcessingBatch) -> ProcessingJob:
            return ProcessingJob.from_batch(
                batch, user_id=self.user_id, dataset_name=self.name
            )

        return map(batch_to_job, self.to_batches())

    @classmethod
    def from_dataset(cls, dataset: Dataset, user_id: str, processed: bool):
        return cls(
            user_id=user_id,
            processed=processed,
            **dict(
                (field.name, getattr(dataset, field.name)) for field in fields(dataset)
            ),
        )

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> CloudDataset:
        dataset = Dataset.from_dict(data)
        return cls.from_dataset(
            dataset, user_id=data["user_id"], processed=data["processed"]
        )

    def to_dict(self) -> Dict[str, Any]:
        result = super().to_dict()
        result["user_id"] = self.user_id
        result["processed"] = self.processed
        return result
