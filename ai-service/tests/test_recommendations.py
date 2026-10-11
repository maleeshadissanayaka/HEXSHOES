from pathlib import Path

import numpy as np
import pytest

from app.services.catalog_index_service import CatalogIndexService, IndexMetadata
from app.services.multimodal_service import fuse_multimodal_embeddings
from app.services.recommendation_service import Interaction, RecommendationService


def index() -> CatalogIndexService:
    service = CatalogIndexService(Path("unused"), "model", "weights")
    service._accept(
        np.array([[1.0, 0.0], [0.8, 0.6], [0.0, 1.0], [-1.0, 0.0]], dtype=np.float32),
        ["hx-01", "hx-02", "hx-03", "hx-04"],
        IndexMetadata("model", "weights", 2, True, "2026-01-01T00:00:00Z", 4),
    )
    return service


def test_multimodal_fusion_normalizes_weighted_modalities() -> None:
    fused = fuse_multimodal_embeddings(np.array([1.0, 0.0]), np.array([0.0, 1.0]), 0.6, 0.4)
    assert np.allclose(fused, np.array([0.8320503, 0.5547002], dtype=np.float32))
    assert np.linalg.norm(fused) == pytest.approx(1.0)


def test_multimodal_single_modality_and_empty_validation() -> None:
    assert np.allclose(fuse_multimodal_embeddings(np.array([2.0, 0.0]), None), [1.0, 0.0])
    assert np.allclose(fuse_multimodal_embeddings(None, np.array([0.0, 3.0])), [0.0, 1.0])
    with pytest.raises(ValueError, match="modality"):
        fuse_multimodal_embeddings(None, None)


def test_similar_products_exclude_source_and_rank_deterministically() -> None:
    results = RecommendationService(index()).similar("hx-01", 3)
    assert [item.product_id for item in results] == ["hx-02", "hx-03", "hx-04"]
    assert "hx-01" not in [item.product_id for item in results]


def test_weighted_interest_vector_and_grounded_reason() -> None:
    service = RecommendationService(index())
    interactions = [Interaction("hx-01", "wishlist", 1.0), Interaction("hx-03", "cart", 2.0)]
    vector = service.interest_vector(interactions)
    assert np.linalg.norm(vector) == pytest.approx(1.0)
    results = service.recommend(interactions, 2)
    assert [item.product_id for item in results] == ["hx-02", "hx-04"]
    assert results[0].reason_code in {"SIMILAR_TO_WISHLIST", "SIMILAR_TO_CART"}


def test_unknown_product_and_top_k_are_rejected() -> None:
    service = RecommendationService(index())
    with pytest.raises(ValueError, match="Unknown product"):
        service.similar("missing", 2)
    with pytest.raises(ValueError, match="topK"):
        service.similar("hx-01", 4)
