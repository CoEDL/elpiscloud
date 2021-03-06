from typing import List
from flask import Response, abort


def cors_preflight(request_methods: List[str]):
    # Allows GET requests from any origin with the Content-Type
    # header and caches preflight response for an 3600s
    headers = {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": request_methods,
        "Access-Control-Allow-Headers": ["Content-Type", "Authorization"],
        "Access-Control-Max-Age": "3600",
    }

    return ("", 200, headers)


def cors_wrap_abort(status: int):
    headers = {"Access-Control-Allow-Origin": "*"}
    abort(Response(status=status, headers=headers))


def cors_wrap_response(data, status: int):
    headers = {"Access-Control-Allow-Origin": "*"}

    return (data, status, headers)
