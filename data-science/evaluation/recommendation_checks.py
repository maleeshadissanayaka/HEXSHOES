from __future__ import annotations

from collections.abc import Sequence
from typing import Protocol


class RecommendationLike(Protocol):
    product_id: str
    reason_code: str
    reason_product_id: str


def validate_ranked_recommendations(
    results: Sequence[RecommendationLike], interactions: dict[str, str], valid_product_ids: set[str]
) -> list[str]:
    errors: list[str] = []
    result_ids = [item.product_id for item in results]
    if len(result_ids) != len(set(result_ids)):
        errors.append("duplicate product IDs")
    if any(item not in valid_product_ids for item in result_ids):
        errors.append("unknown product ID")
    if set(result_ids) & interactions.keys():
        errors.append("interacted product was not excluded")
    for item in results:
        signal = interactions.get(item.reason_product_id)
        expected = "SIMILAR_TO_WISHLIST" if signal == "wishlist" else "SIMILAR_TO_CART" if signal == "cart" else None
        if expected is None or item.reason_code != expected:
            errors.append(f"ungrounded reason for {item.product_id}")
    return errors


def cold_start_selection(products: Sequence[dict[str, object]], limit: int = 3) -> list[str]:
    """Mirror Express's stable new-first catalog-discovery policy."""
    return [str(item["id"]) for item in sorted(products, key=lambda item: not bool(item["isNew"]))[:limit]]
