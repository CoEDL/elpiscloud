# Trainer Service

This is the directory for the Trainer service, which takes some model training
metadata, and trains/uploads the resulting model to cloud storage for future
transcription jobs.

## Installation

- Make sure you have poetry installed, and a compatible python version.
- Create a virtual env and install the dependencies: `poetry install`

## Running the tests

- Unit tests: `poetry run pytest -m 'not integration'`
- Integration tests: `poetry run pytest -m 'integration'`
