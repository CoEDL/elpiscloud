from base64 import b64decode


def decode_auth_header(user_info_header: str):
    message_bytes = b64decode(user_info_header + "==")
    return message_bytes.decode("ascii")
