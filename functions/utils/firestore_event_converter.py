from typing import Any, Dict

ACTIONS = {
    "stringValue": (lambda x: str(x)),
    "arrayValue": (
        lambda x: [_parse_value(value_dict) for value_dict in x.get("values", [])]
    ),
    "booleanValue": (lambda x: bool(x)),
    "nullValue": (lambda _: None),
    "mapValue": (
        lambda x: {key: _parse_value(value) for key, value in x["fields"].items()}
    ),
    "integerValue": (lambda x: int(x)),
    "doubleValue": (lambda x: float(x)),
}


def unpack(data: Dict[str, Any]) -> Dict[str, Any]:
    """Unpacks a firestore event value dictionary into its base types.

    Parameters:
        data: The incoming firestore event value dictionary

    Returns:
        A dictionary without the intermediary value sections.
    """
    if "fields" in data:
        return {k: _parse_value(v) for k, v in data["fields"].items()}
    return {k: _parse_value(v) for k, v in data.items()}


def _parse_value(value_dict: Dict[str, Any]) -> Any:
    data_type, value = value_dict.popitem()
    action = ACTIONS.get(data_type, ACTIONS["nullValue"])
    return action(value)
