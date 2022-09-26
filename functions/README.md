# Cloud Functions

This directory contains the cloud functions, tests and utility libraries
for elpis cloud.

## Installation

- Make sure you have poetry installed, and a compatible python version.
- Create a virtual env and install the dependencies: `poetry install`

## Running the tests

`poetry run pytest`

## IMPORTANT!

The pipeline's cloud function deployment looks for a `requirements.txt` file
within this directory. This means that every time a dependency changes and
you want that reflected in prod, you must manually update the requirements
with:

`poetry export -f requirements.txt --output requirements.txt`

TODO: move the above process into the pipeline before terraform stages.
