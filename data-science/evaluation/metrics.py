from __future__ import annotations

import math
from collections.abc import Sequence, Set


def _validate_k(k: int) -> None:
    if isinstance(k, bool) or not isinstance(k, int) or k < 1:
        raise ValueError("k must be a positive integer")


def precision_at_k(ranking: Sequence[str], relevant: Set[str], k: int) -> float:
    _validate_k(k)
    return sum(item in relevant for item in ranking[:k]) / k


def recall_at_k(ranking: Sequence[str], relevant: Set[str], k: int) -> float:
    _validate_k(k)
    if not relevant:
        return 0.0
    return sum(item in relevant for item in ranking[:k]) / len(relevant)


def reciprocal_rank(ranking: Sequence[str], relevant: Set[str]) -> float:
    if not relevant:
        return 0.0
    return next((1.0 / rank for rank, item in enumerate(ranking, 1) if item in relevant), 0.0)


def ndcg_at_k(ranking: Sequence[str], relevant: Set[str], k: int) -> float:
    _validate_k(k)
    if not relevant:
        return 0.0
    dcg = sum((1.0 / math.log2(rank + 1)) for rank, item in enumerate(ranking[:k], 1) if item in relevant)
    ideal_hits = min(len(relevant), k)
    ideal = sum(1.0 / math.log2(rank + 1) for rank in range(1, ideal_hits + 1))
    return dcg / ideal
