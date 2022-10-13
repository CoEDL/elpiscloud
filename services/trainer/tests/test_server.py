import base64
from http import HTTPStatus
from pathlib import Path
from typing import Any, Dict
from unittest.mock import Mock

import pytest
from flask.testing import FlaskClient
from tests.test_model_metadata import VALID_METADATA
from trainer.main import (
    BAD_MODEL_METADATA_FORMAT,
    BAD_PUBSUB_MESSAGE_FORMAT,
    MISSING_PUBSUB_DATA,
    NO_ENVELOPE,
    app,
)

DATA_PATH = (Path(__file__).parent / "data").resolve()
VALID_METADATA = Path(DATA_PATH, "valid_model_metadata.json")
INVALID_METADATA = Path(DATA_PATH, "invalid_model_metadata.json")


def _encode_metadata(path: Path) -> bytes:
    with open(path) as metadata_file:
        metadata = metadata_file.read()

    return base64.b64encode(metadata.encode("utf-8"))


def _wrap_metadata(message: bytes) -> Dict[str, Any]:
    return {"message": {"data": message.decode("utf-8")}}


@pytest.fixture()
def client():
    return app.test_client()


@pytest.fixture()
def runner():
    return app.test_cli_runner()


@pytest.fixture()
def hook_mock(mocker) -> Mock:
    return mocker.patch("trainer.main.process_training_request")


def test_index_with_valid_metadata(client: FlaskClient, hook_mock: Mock):
    data = _wrap_metadata(_encode_metadata(VALID_METADATA))
    response = client.post("/", json=data)

    assert response.status_code == HTTPStatus.NO_CONTENT.value
    hook_mock.assert_not_called()

    response.close()
    hook_mock.assert_called_once()


def assert_bad_request(
    client: FlaskClient, hook_mock: Mock, expected_response: str, **client_kwargs
):
    response = client.post("/", **client_kwargs)
    hook_mock.assert_not_called()
    assert response.status_code == HTTPStatus.BAD_REQUEST.value
    assert expected_response in response.get_data(as_text=True)


def test_index_with_invalid_json_payload_returns_error(
    client: FlaskClient, hook_mock: Mock
):
    assert_bad_request(client, hook_mock, expected_response=NO_ENVELOPE, data="hi")


def test_index_with_invalid_pubsub_format_returns_error(
    client: FlaskClient, hook_mock: Mock
):
    assert_bad_request(
        client, hook_mock, expected_response=BAD_PUBSUB_MESSAGE_FORMAT, json="hi"
    )


def test_index_with_missing_message_data_returns_error(
    client: FlaskClient, hook_mock: Mock
):
    data = {"message": 1}
    assert_bad_request(
        client, hook_mock, expected_response=MISSING_PUBSUB_DATA, json=data
    )
    data = {"message": {}}
    assert_bad_request(
        client, hook_mock, expected_response=MISSING_PUBSUB_DATA, json=data
    )


def test_index_with_invalid_model_metadata_returns_error(
    client: FlaskClient, hook_mock: Mock
):
    data = _wrap_metadata(_encode_metadata(INVALID_METADATA))
    assert_bad_request(
        client, hook_mock, expected_response=BAD_MODEL_METADATA_FORMAT, json=data
    )
