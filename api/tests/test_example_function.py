from api.functions.example_funtion import hello


def test_hello():
    assert hello() == "Hello, world!"
