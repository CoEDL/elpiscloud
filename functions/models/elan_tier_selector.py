from enum import Enum


class TierSelector(Enum):
    """A class representing a method of selecting elan tiers"""

    ORDER = "tier_order"
    TYPE = "tier_type"
    NAME = "tier_name"
