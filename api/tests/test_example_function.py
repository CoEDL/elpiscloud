from api.functions.health_check import hello


def test_hello():
    assert hello() == "Hello, world!"
