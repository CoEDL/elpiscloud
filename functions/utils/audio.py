import wave
from pathlib import Path


def get_sample_rate(file: Path) -> int:
    """Gets the current sample rate of the given wav file.

    Parameters:
        file: The path to the audio file.

    Returns:
        The sample rate of the given file.
    """
    with open(file, "rb") as f:
        wave_object = wave.open(f, "rb")
        sample_rate = wave_object.getframerate()
        wave_object.close()

    return sample_rate


def resample(file: Path, destination: Path, sample_rate: int) -> None:
    """Copies a wav file to the destination, with the given
    sample rate.

    Parameters:
        file (Path): The path of the file to resample
        destination (Path): The destination at which to create the resampled file
        sample_rate (int): The sample rate for the resampled audio.
    """
    with open(file, "rb") as f:
        wave_object = wave.open(f, "rb")
        params = wave_object.getparams()
        frames = wave_object.readframes(wave_object.getnframes())
        wave_object.close()

    with open(destination, "wb") as f:
        result = wave.open(f, "wb")
        result.setparams(params)
        result.setframerate(sample_rate)
        result.writeframes(frames)
        result.close()


def cut(file: Path, destination: Path, start_ms: int, stop_ms: int) -> None:
    """Creates a new wav file at the destination, restricted to the given start
    and stop times.

    Parameters:
        file (Path): The path of the file to resample.
        destination (Path): The destination at which to create the resampled file.
        start_ms (int): The start time in milliseconds to record from.
        stop_ms (int):  The stop time in milliseconds to record to.
    """
    with open(file, "rb") as f:
        wave_object = wave.open(f, "rb")
        params = wave_object.getparams()
        frames = wave_object.readframes(wave_object.getnframes())
        width = wave_object.getsampwidth()
        sample_rate = wave_object.getframerate()
        wave_object.close()

    start = round(sample_rate * start_ms / 1000)
    stop = round(sample_rate * stop_ms / 1000)

    with open(destination, "wb") as f:
        result = wave.open(f, "wb")
        result.setparams(params)
        # Have to multiply by sample width to get proper byte indices
        result.writeframes(frames[start * width : stop * width])
        result.close()
