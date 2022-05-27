from typing import Dict
from functions_framework import Context


def delete_dataset(data: Dict, context: Context) -> None:
    print(data)
    print(context)
