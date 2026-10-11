from dataclasses import dataclass
from typing import Literal

import numpy as np
from numpy.typing import NDArray

from app.services.catalog_index_service import CatalogIndexService, SearchResult
from app.services.similarity_service import l2_normalize

Signal = Literal["wishlist", "cart"]


@dataclass(frozen=True)
class Interaction:
    product_id: str
    signal: Signal
    weight: float


@dataclass(frozen=True)
class RecommendationResult:
    rank: int
    product_id: str
    score: float
    reason_code: str
    reason_product_id: str


class RecommendationService:
    def __init__(self, index: CatalogIndexService) -> None:
        if not index.loaded or index.embeddings is None:
            raise ValueError("Catalog index is not loaded")
        self.index = index

    def _vector(self, product_id: str) -> NDArray[np.float32]:
        try:
            position = self.index.product_ids.index(product_id)
        except ValueError as error:
            raise ValueError(f"Unknown product ID: {product_id}") from error
        return self.index.embeddings[position]  # type: ignore[index]

    def similar(self, product_id: str, limit: int) -> list[SearchResult]:
        self._validate_limit(limit, len(self.index.product_ids) - 1)
        ranked = self.index.search(self._vector(product_id), len(self.index.product_ids))
        filtered = [item for item in ranked if item.product_id != product_id][:limit]
        return [SearchResult(rank + 1, item.product_id, item.similarity_score) for rank, item in enumerate(filtered)]

    def interest_vector(self, interactions: list[Interaction]) -> NDArray[np.float32]:
        if not interactions:
            raise ValueError("At least one interaction is required")
        vectors: list[NDArray[np.float32]] = []
        weights: list[float] = []
        for interaction in interactions:
            if interaction.signal not in ("wishlist", "cart"):
                raise ValueError("Unknown interaction signal")
            if not np.isfinite(interaction.weight) or interaction.weight <= 0:
                raise ValueError("Interaction weights must be finite and positive")
            vectors.append(self._vector(interaction.product_id))
            weights.append(interaction.weight)
        return l2_normalize(np.average(np.stack(vectors), axis=0, weights=np.asarray(weights)))[0]

    def recommend(self, interactions: list[Interaction], limit: int) -> list[RecommendationResult]:
        excluded = {item.product_id for item in interactions}
        self._validate_limit(limit, max(1, len(self.index.product_ids) - len(excluded)))
        interest = self.interest_vector(interactions)
        ranked = [item for item in self.index.search(interest, len(self.index.product_ids)) if item.product_id not in excluded][:limit]
        output: list[RecommendationResult] = []
        for rank, item in enumerate(ranked, 1):
            candidate = self._vector(item.product_id)
            evidence = max(interactions, key=lambda interaction: float(candidate @ self._vector(interaction.product_id)) * interaction.weight)
            reason_code = "SIMILAR_TO_WISHLIST" if evidence.signal == "wishlist" else "SIMILAR_TO_CART"
            output.append(RecommendationResult(rank, item.product_id, item.similarity_score, reason_code, evidence.product_id))
        return output

    @staticmethod
    def _validate_limit(limit: int, maximum: int) -> None:
        if not isinstance(limit, int) or isinstance(limit, bool) or limit < 1 or limit > maximum:
            raise ValueError(f"topK must be an integer from 1 to {maximum}")
