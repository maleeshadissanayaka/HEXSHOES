import numpy as np
import pytest

from app.services.similarity_service import cosine_similarities, l2_normalize, top_k


def test_l2_normalize_returns_unit_vectors() -> None:
    normalized = l2_normalize(np.array([[3.0, 4.0], [0.0, 2.0]], dtype=np.float32))
    np.testing.assert_allclose(np.linalg.norm(normalized, axis=1), [1.0, 1.0], atol=1e-6)


def test_l2_normalize_rejects_zero_and_non_finite_vectors() -> None:
    with pytest.raises(ValueError):
        l2_normalize(np.array([0.0, 0.0]))
    with pytest.raises(ValueError):
        l2_normalize(np.array([np.inf, 1.0]))


def test_cosine_similarity_and_ranking_use_normalized_dot_product() -> None:
    query = np.array([1.0, 0.0], dtype=np.float32)
    candidates = np.array([[0.0, 1.0], [2.0, 0.0], [-1.0, 0.0]], dtype=np.float32)
    np.testing.assert_allclose(cosine_similarities(query, candidates), [0.0, 1.0, -1.0], atol=1e-6)
    assert top_k(query, candidates, 2) == [(1, 1.0), (0, 0.0)]
