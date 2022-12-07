from pathlib import Path
from unittest.mock import Mock

from elpis.datasets import CleaningOptions
from elpis.models import ElanOptions, ElanTierSelector
from models import ProcessingJob

from functions.datasets.process_file import download_files, has_finished_processing

ABUI_DATASET_FILES = ["abui_1.eaf", "abui_1.wav", "abui_2.eaf", "abui_2.wav"]

TEST_JOB = ProcessingJob(
    user_id="1",
    dataset_name="Dataset",
    transcription_file=Path(ABUI_DATASET_FILES[0]),
    audio_file=Path(ABUI_DATASET_FILES[1]),
    cleaning_options=CleaningOptions(),
    elan_options=ElanOptions(ElanTierSelector.ORDER, "1"),
)


def test_download_files(mocker):
    downloader_mock: Mock = mocker.patch(
        "functions.datasets.process_file.download_blob"
    )
    dir = Path()
    transcript_file, audio_file = download_files(job=TEST_JOB, dir=dir)

    assert downloader_mock.call_count == 2
    assert transcript_file == dir / TEST_JOB.transcription_file
    assert audio_file == dir / TEST_JOB.audio_file


def test_has_finished_processing():
    processed_files = ["abui_1.json", "abui_1.wav", "abui_2.json", "abui_2.wav"]
    assert has_finished_processing(ABUI_DATASET_FILES, processed_files)


def test_has_finished_procesing_with_path_prefixes():
    processed_files = ["abui_1.json", "abui_1.wav", "abui_2.json", "abui_2.wav"]
    prefix = "someUserId/datasetName/"
    processed_files = [prefix + name for name in processed_files]
    assert has_finished_processing(ABUI_DATASET_FILES, processed_files)


def test_has_finished_processing_with_incomplete_files_should_return_false():
    processed_files = ["abui_1.json", "abui_1.wav"]
    assert not has_finished_processing(ABUI_DATASET_FILES, processed_files)


def test_has_finished_processing_with_timed_annotations():
    processed_files = [
        "abui_1.json",
        "abui_1.wav",
        "abui_2_1000.json",
        "abui_2_1000.wav",
    ]
    assert has_finished_processing(ABUI_DATASET_FILES, processed_files)


def test_has_finished_processing_with_timed_and_multiple_annotations():
    processed_files = [
        "abui_1.json",
        "abui_1.wav",
        "abui_2_1000.json",
        "abui_2_1000.wav",
        "abui_2_3000.json",
        "abui_2_3000.wav",
    ]
    assert has_finished_processing(ABUI_DATASET_FILES, processed_files)
