from pathlib import Path

import soundfile as sf


def get_sample_rate(file: Path) -> int:
    """Gets the current sample rate of the given audio file.

    Parameters:
        file: The path to the audio file.

    Returns:
        The sample rate of the given file.
    """
    _, sample_rate = sf.read(file)
    return sample_rate


def resample(file: Path, destination: Path, sample_rate: int) -> None:
    """Copies an audio file to the destination, with the given
    sample rate.

    Parameters:
        file (Path): The path of the file to resample
        destination (Path): The destination at which to create the resampled file
        sample_rate (int): The sample rate for the resampled audio.
    """
    data, _ = sf.read(file)
    sf.write(destination, data, sample_rate)


def cut(
    file: Path, destination: Path, sample_rate: int, start_ms: int, stop_ms: int
) -> None:
    start = round(sample_rate * start_ms / 1000)
    stop = round(sample_rate * stop_ms / 1000)
    data, _ = sf.read(file, start=start, stop=stop)
    sf.write(destination, data, sample_rate)
