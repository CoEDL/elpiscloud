from pathlib import Path
from unittest.mock import Mock

import soundfile as sf
from loguru import logger
from utils.audio import cut, get_sample_rate, resample

DATA_DIR = Path(__file__).parent.parent / "data"
TARGET_SAMPLE_RATE = 23_000


def test_cut(tmp_path: Path):
    logger.info(f"Test cutting dir: {tmp_path}")
    audio = DATA_DIR / "test.wav"
    cut_audio = tmp_path / "test.wav"
    start_ms = 0
    stop_ms = 1000
    sample_rate = get_sample_rate(audio)
    cut(
        file=audio,
        destination=cut_audio,
        sample_rate=sample_rate,
        start_ms=start_ms,
        stop_ms=stop_ms,
    )
    data, _ = sf.read(cut_audio)
    assert len(data) == (stop_ms - start_ms) * sample_rate / 1000


def test_resample(tmp_path: Path):
    audio = DATA_DIR / "test.wav"
    resampled_audio = tmp_path / "test.wav"
    resample(audio, resampled_audio, TARGET_SAMPLE_RATE)
    assert resampled_audio.exists()

    _, sample_rate = sf.read(resampled_audio)
    assert sample_rate == TARGET_SAMPLE_RATE


def test_get_sample_rate(mocker):
    sf_mock: Mock = mocker.patch("utils.audio.sf.read")
    sf_mock.return_value = None, 69
    assert get_sample_rate(Path()) == 69
