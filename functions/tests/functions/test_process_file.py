import json
from pathlib import Path
from unittest.mock import Mock

from models import Annotation, DatasetOptions, ProcessingJob

from functions.datasets.process_file import (
    clean_annotation,
    download_files,
    generate_training_files,
    has_finished_processing,
)

TEST_ANNOTATION = Annotation(audio_file_name="test.wav", transcript="hi")
TEST_ANNOTATION_TIMED = Annotation(
    audio_file_name="test.wav",
    transcript="hi",
    start_ms=0,
    stop_ms=1000,
)

TEST_JOB = ProcessingJob(
    user_id="1",
    transcription_file_name="test.eaf",
    audio_file_name="test.wav",
    dataset_name="dataset",
    options=DatasetOptions(),
)


def test_download_files(mocker):
    downloader_mock: Mock = mocker.patch(
        "functions.datasets.process_file.download_blob"
    )
    dir = Path()
    transcript_file, audio_file = download_files(job=TEST_JOB, dir=dir)

    assert downloader_mock.call_count == 2
    assert transcript_file == dir / TEST_JOB.transcription_file_name
    assert audio_file == dir / TEST_JOB.audio_file_name


def test_clean_annotation(mocker):
    cleaner_mock: Mock = mocker.patch("functions.datasets.process_file.clean_text")
    cleaner_mock.return_value = "wow"

    result = clean_annotation(TEST_ANNOTATION, DatasetOptions())
    cleaner_mock.assert_called_once()
    assert result.transcript == "wow"
    assert TEST_ANNOTATION.transcript == "hi"


def test_generate_training_files_with_untimed_annotation(tmp_path: Path, mocker):
    cut_mock: Mock = mocker.patch("functions.datasets.process_file.audio.cut")
    audio_file = tmp_path / "test.wav"

    transcription, audio = generate_training_files(
        TEST_ANNOTATION, audio_file, tmp_path
    )
    cut_mock.assert_not_called()
    assert transcription == tmp_path / "test.json"
    assert audio == audio_file

    with open(transcription) as f:
        assert Annotation.from_dict(json.load(f)) == TEST_ANNOTATION


def test_generate_training_files_with_timed_annotation(tmp_path: Path, mocker):
    cut_mock: Mock = mocker.patch("functions.datasets.process_file.audio.cut")
    audio_file = tmp_path / "test.wav"

    transcription, audio = generate_training_files(
        TEST_ANNOTATION_TIMED, audio_file, tmp_path
    )
    cut_mock.assert_called_once()
    assert transcription == tmp_path / f"test_{TEST_ANNOTATION_TIMED.start_ms}.json"
    assert audio == tmp_path / f"test_{TEST_ANNOTATION_TIMED.start_ms}.wav"

    with open(transcription) as f:
        assert Annotation.from_dict(json.load(f)) == TEST_ANNOTATION_TIMED


def test_has_finished_processing():
    dataset_files = ["1.eaf", "1.wav", "2.eaf", "2.wav"]
    processed_files = ["1.json", "1.wav"]
    assert not has_finished_processing(dataset_files, processed_files)

    processed_files = ["1.json", "1.wav", "2.json", "2.wav"]
    assert has_finished_processing(dataset_files, processed_files)

    processed_files = [
        "1.json",
        "1.wav",
        "2_1000.json",
        "2_1000.wav",
    ]
    assert has_finished_processing(dataset_files, processed_files)

    processed_files = [
        "1.json",
        "1.wav",
        "2_1000.json",
        "2_1000.wav",
        "2_3000.json",
        "2_3000.wav",
    ]
    assert has_finished_processing(dataset_files, processed_files)
