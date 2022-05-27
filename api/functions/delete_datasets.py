from typing import Dict
from functions_framework import Context


def delete_dataset_from_bucket(data: Dict, context: Context) -> None:
    print(data)
    print(context)
