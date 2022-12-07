from pathlib import Path

from elpis.datasets import CleaningOptions, Dataset
from elpis.datasets.dataset import ElanOptions
from elpis.models import ElanTierSelector
from models.dataset import CloudDataset, ProcessingJob

# ====== Dataset ======
FILES_WITH_ELAN = [Path(name) for name in ("1.eaf", "1.wav")]

DATASET = Dataset(
    name="dataset",
    files=FILES_WITH_ELAN,
    cleaning_options=CleaningOptions(),
    elan_options=ElanOptions(ElanTierSelector.NAME, "Phrase"),
)

CLOUD_DATASET_DICT = {"processed": False, "user_id": "1", **DATASET.to_dict()}


def test_build_cloud_dataset():
    dataset = CloudDataset.from_dict(CLOUD_DATASET_DICT)
    assert dataset.user_id == "1"
    assert dataset.processed == False


def test_serialize_cloud_dataset():
    dataset = CloudDataset.from_dict(CLOUD_DATASET_DICT)
    assert dataset.to_dict() == CLOUD_DATASET_DICT


def test_create_processing_jobs():
    dataset = CloudDataset.from_dict(CLOUD_DATASET_DICT)

    def has_correct_attributes(job: ProcessingJob) -> bool:
        return job.dataset_name == dataset.name and job.user_id == job.user_id

    assert all(map(has_correct_attributes, dataset.to_jobs()))
