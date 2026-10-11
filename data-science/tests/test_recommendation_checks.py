from dataclasses import dataclass

from evaluation.recommendation_checks import cold_start_selection, validate_ranked_recommendations


@dataclass
class Result:
    product_id: str
    reason_code: str
    reason_product_id: str


def test_valid_grounded_recommendations_pass() -> None:
    results = [Result("hx-02", "SIMILAR_TO_WISHLIST", "hx-01"), Result("hx-04", "SIMILAR_TO_CART", "hx-03")]
    assert validate_ranked_recommendations(results, {"hx-01": "wishlist", "hx-03": "cart"}, {"hx-01", "hx-02", "hx-03", "hx-04"}) == []


def test_interacted_unknown_and_ungrounded_results_fail() -> None:
    results = [Result("hx-01", "SIMILAR_TO_CART", "missing"), Result("unknown", "SIMILAR_TO_CART", "hx-03")]
    errors = validate_ranked_recommendations(results, {"hx-01": "wishlist", "hx-03": "cart"}, {"hx-01", "hx-02", "hx-03", "hx-04"})
    assert "interacted product was not excluded" in errors
    assert "unknown product ID" in errors
    assert any("ungrounded" in error for error in errors)


def test_cold_start_is_stable_new_first_discovery() -> None:
    products = [{"id": "old-a", "isNew": False}, {"id": "new-a", "isNew": True}, {"id": "new-b", "isNew": True}, {"id": "old-b", "isNew": False}]
    assert cold_start_selection(products) == ["new-a", "new-b", "old-a"]
