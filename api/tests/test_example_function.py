from api.functions.example_function import hello


def test_hello():
    assert hello() == "Hello, world!"
