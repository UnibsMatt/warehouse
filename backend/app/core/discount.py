"""Utility functions for calculating order discounts."""


def calculate_discount(tiers: list, quantity: int) -> float:
    """
    Return the discount percentage (0.0–100.0) applicable for the given quantity.

    Tiers are evaluated in ascending order of min_quantity; the highest-threshold
    tier that the quantity satisfies wins.

    Args:
        tiers: list of dicts with keys ``min_quantity`` (int) and
               ``discount_percent`` (float).
        quantity: the ordered quantity to check against.

    Returns:
        The applicable discount as a percentage, e.g. 10.0 means 10 % off.
        Returns 0.0 when no tier applies or ``tiers`` is empty.

    Example:
        tiers = [
            {"min_quantity": 10, "discount_percent": 5.0},
            {"min_quantity": 25, "discount_percent": 10.0},
            {"min_quantity": 50, "discount_percent": 15.0},
        ]
        calculate_discount(tiers, 30)  # → 10.0
        calculate_discount(tiers, 5)   # →  0.0
    """
    if not tiers:
        return 0.0

    applicable = 0.0
    for tier in sorted(tiers, key=lambda t: t["min_quantity"]):
        if quantity >= tier["min_quantity"]:
            applicable = float(tier["discount_percent"])
    return applicable


def apply_discount(unit_price: float, tiers: list, quantity: int) -> float:
    """
    Return the discounted unit price after applying the best applicable tier.

    Args:
        unit_price: the base price per unit.
        tiers: discount tier list (see ``calculate_discount``).
        quantity: ordered quantity.

    Returns:
        Unit price after discount, rounded to 2 decimal places.
    """
    discount_pct = calculate_discount(tiers, quantity)
    return round(unit_price * (1 - discount_pct / 100), 2)
