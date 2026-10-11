import numpy as np
from numpy.typing import NDArray

FloatArray = NDArray[np.float32]


def l2_normalize(vectors: NDArray[np.floating]) -> FloatArray:
    values = np.asarray(vectors, dtype=np.float32)
    if values.ndim == 1:
        values = values.reshape(1, -1)
    if values.ndim != 2 or values.shape[1] == 0:
        raise ValueError("Embeddings must be a non-empty vector or matrix")
    norms = np.linalg.norm(values, axis=1, keepdims=True)
    if not np.all(np.isfinite(values)) or np.any(norms == 0):
        raise ValueError("Embeddings must contain finite, non-zero vectors")
    return values / norms


def cosine_similarities(query: NDArray[np.floating], candidates: NDArray[np.floating]) -> FloatArray:
    normalized_query = l2_normalize(query)
    normalized_candidates = l2_normalize(candidates)
    if normalized_query.shape[0] != 1 or normalized_query.shape[1] != normalized_candidates.shape[1]:
        raise ValueError("Expected one query with the same dimension as every candidate")
    return (normalized_candidates @ normalized_query[0]).astype(np.float32)


def top_k(query: NDArray[np.floating], candidates: NDArray[np.floating], limit: int) -> list[tuple[int, float]]:
    if limit < 1:
        raise ValueError("Top-k limit must be positive")
    scores = cosine_similarities(query, candidates)
    order = np.argsort(-scores, kind="stable")[: min(limit, len(scores))]
    return [(int(index), float(scores[index])) for index in order]
