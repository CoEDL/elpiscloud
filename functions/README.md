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

## Badly linked `soundfile` library.

If you get an error message on Mac Os that reads along the lines of:

```
OSError: cannot load library ... blah blah ... libsndfile.dylib' (no such file)
```

Here are the steps I took to fix this:

```

brew install libsndfile
...

brew list libsndfile | grep dylib
/opt/homebrew/Cellar/libsndfile/1.1.0/lib/libsndfile.1.dylib
/opt/homebrew/Cellar/libsndfile/1.1.0/lib/libsndfile.dylib

ls -l /opt/homebrew/Cellar/libsndfile/1.1.0/lib/
total 912
-r--r--r--  1 raf  admin  466656 Jun 12 14:42 libsndfile.1.dylib
lrwxr-xr-x  1 raf  admin      18 Mar 27 14:42 libsndfile.dylib -> libsndfile.1.dylib
drwxr-xr-x  3 raf  admin      96 Jun 12 14:42 pkgconfig

SF_PATH=$(poetry env info -p)/lib/python3.10/site-packages/_soundfile_data/

mkdir -p $SF_PATH

ln -s $(brew list libsndfile | grep dylib | head -n 1) $SF_PATH/libsndfile.dylib

poetry shell

python3
>>> import soundfile
>>>
```
