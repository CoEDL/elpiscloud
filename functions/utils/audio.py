import wave
from pathlib import Path


def get_sample_rate(audio_file: Path) -> int:
    """Gets the current sample rate of the given wav file.

    Parameters:
        audio_file: The path to the audio file.

    Returns:
        The sample rate of the given file.
    """
    audio_wave = wave.open(str(audio_file), "rb")
    sample_rate = audio_wave.getframerate()
    audio_wave.close()

    return sample_rate


def resample(audio_file: Path, destination: Path, sample_rate: int) -> None:
    """Copies a wav file to the destination, with the given
    sample rate.

    Parameters:
        audio_file (Path): The path of the file to resample
        destination (Path): The destination at which to create the resampled file
        sample_rate (int): The sample rate for the resampled audio.
    """
    audio_wave = wave.open(str(audio_file), "rb")
    params = audio_wave.getparams()
    frames = audio_wave.readframes(audio_wave.getnframes())
    audio_wave.close()

    destination_wave = wave.open(str(destination), "wb")
    destination_wave.setparams(params)
    destination_wave.setframerate(sample_rate)
    destination_wave.writeframes(frames)
    destination_wave.close()


def cut(audio_file: Path, destination: Path, start_ms: int, stop_ms: int) -> None:
    """Creates a new wav file at the destination, restricted to the given start
    and stop times.

    Parameters:
        audio_file (Path): The path of the file to resample.
        destination (Path): The destination at which to create the resampled file.
        start_ms (int): The start time in milliseconds to record from.
        stop_ms (int):  The stop time in milliseconds to record to.
    """
    audio_wave = wave.open(str(audio_file), "rb")
    params = audio_wave.getparams()
    frames = audio_wave.readframes(audio_wave.getnframes())
    width = audio_wave.getsampwidth()
    sample_rate = audio_wave.getframerate()
    audio_wave.close()

    start = round(sample_rate * start_ms / 1000)
    stop = round(sample_rate * stop_ms / 1000)

    destination_wave = wave.open(str(destination), "wb")
    destination_wave.setparams(params)
    # Have to multiply by sample width to get proper byte indices
    destination_wave.writeframes(frames[start * width : stop * width])
    destination_wave.close()
