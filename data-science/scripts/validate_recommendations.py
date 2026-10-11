from __future__ import annotations

import json
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "data-science"))
sys.path.insert(0, str(ROOT / "ai-service"))

from evaluation.recommendation_checks import cold_start_selection, validate_ranked_recommendations
from app.config import settings
from app.services.catalog_index_service import CatalogIndexService
from app.services.recommendation_service import Interaction, RecommendationService


def main() -> None:
    index = CatalogIndexService(settings.catalog_index_directory, settings.model_name, settings.pretrained)
    index.load()
    service = RecommendationService(index)
    interactions = [Interaction("hx-01", "wishlist", 1.0), Interaction("hx-03", "cart", 1.3)]
    first = service.recommend(interactions, 2)
    second = service.recommend(interactions, 2)
    similar = service.similar("hx-01", 3)
    errors = validate_ranked_recommendations(first, {"hx-01": "wishlist", "hx-03": "cart"}, set(index.product_ids))
    checks = {
        "sourceProductExcluded": all(item.product_id != "hx-01" for item in similar),
        "interactedItemsExcluded": not errors,
        "deterministicRepeatability": first == second,
        "reasonCodesGrounded": not any("reason" in error for error in errors),
        "validProductIdsOnly": not any("unknown" in error for error in errors),
        "coldStartCorrect": cold_start_selection([{"id": "hx-01", "isNew": True}, {"id": "hx-02", "isNew": True}, {"id": "hx-03", "isNew": False}, {"id": "hx-04", "isNew": False}]) == ["hx-01", "hx-02", "hx-03"],
    }
    report = {"label": "Algorithm test scenarios; not user data and not recommendation accuracy.", "scenario": {"wishlist": ["hx-01"], "cart": [{"productId": "hx-03", "quantityEquivalentWeight": 1.3}]}, "checks": checks, "recommendations": [{"rank": item.rank, "productId": item.product_id, "score": item.score, "reasonCode": item.reason_code, "reasonProductId": item.reason_product_id} for item in first]}
    if errors or not all(checks.values()):
        raise SystemExit(f"Recommendation validation failed: {errors or checks}")
    output = ROOT / "data-science/reports/recommendation_validation.json"
    output.parent.mkdir(parents=True, exist_ok=True)
    output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
