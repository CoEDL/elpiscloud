import wave
from pathlib import Path

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
        audio_file=audio,
        destination=cut_audio,
        start_ms=start_ms,
        stop_ms=stop_ms,
    )

    audio_wave = wave.open(str(cut_audio), "rb")
    assert audio_wave.getnframes() == (stop_ms - start_ms) * sample_rate / 1000
    assert audio_wave.getframerate() == sample_rate
    audio_wave.close()


def test_resample(tmp_path: Path):
    audio = DATA_DIR / "test.wav"
    resampled_audio = tmp_path / "test.wav"
    resample(audio, resampled_audio, TARGET_SAMPLE_RATE)
    assert resampled_audio.exists()

    resampled_audio_wave = wave.open(str(resampled_audio), "rb")
    assert resampled_audio_wave.getframerate() == TARGET_SAMPLE_RATE
    resampled_audio_wave.close()


def test_get_sample_rate():
    audio = DATA_DIR / "test.wav"
    assert get_sample_rate(audio) == 16_000
