from pathlib import Path
import soundfile as sf


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
