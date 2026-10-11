from __future__ import annotations

from dataclasses import asdict, dataclass
from datetime import UTC, datetime
import json
from pathlib import Path
from typing import Any

import numpy as np
from numpy.typing import NDArray
from PIL import Image, UnidentifiedImageError

from app.services.embedding_service import EmbeddingService
from app.services.similarity_service import l2_normalize, top_k

CANONICAL_PRODUCT_IDS = frozenset({"hx-01", "hx-02", "hx-03", "hx-04"})


@dataclass(frozen=True)
class CatalogItem:
    product_id: str
    image_path: Path


@dataclass(frozen=True)
class IndexMetadata:
    model: str
    pretrained: str
    embedding_dimension: int
    normalized: bool
    created_at: str
    product_count: int


@dataclass(frozen=True)
class SearchResult:
    rank: int
    product_id: str
    similarity_score: float


def load_manifest(path: Path) -> list[CatalogItem]:
    try:
        payload: Any = json.loads(path.read_text(encoding="utf-8"))
    except (OSError, json.JSONDecodeError) as error:
        raise ValueError(f"Unable to read catalog manifest: {path}") from error
    if not isinstance(payload, list) or not payload:
        raise ValueError("Catalog manifest must be a non-empty array")
    items: list[CatalogItem] = []
    for raw in payload:
        if not isinstance(raw, dict) or set(raw) != {"productId", "imagePath"}:
            raise ValueError("Each catalog item must contain only productId and imagePath")
        product_id, image_path = raw["productId"], raw["imagePath"]
        if not isinstance(product_id, str) or product_id not in CANONICAL_PRODUCT_IDS:
            raise ValueError(f"Unknown canonical product ID: {product_id}")
        if not isinstance(image_path, str) or not image_path.strip():
            raise ValueError(f"Invalid image path for {product_id}")
        resolved = (path.parent / image_path).resolve()
        items.append(CatalogItem(product_id, resolved))
    ids = [item.product_id for item in items]
    if len(ids) != len(set(ids)) or set(ids) != CANONICAL_PRODUCT_IDS:
        raise ValueError("Manifest must contain each canonical product exactly once")
    return items


class CatalogIndexService:
    def __init__(self, directory: Path, model: str, pretrained: str) -> None:
        self.directory = directory
        self.model = model
        self.pretrained = pretrained
        self.embeddings: NDArray[np.float32] | None = None
        self.product_ids: list[str] = []
        self.metadata: IndexMetadata | None = None
        self.load_error: str | None = None

    @property
    def loaded(self) -> bool:
        return self.embeddings is not None and self.metadata is not None

    def build(self, manifest_path: Path, embeddings: EmbeddingService) -> IndexMetadata:
        items = load_manifest(manifest_path)
        rows: list[NDArray[np.float32]] = []
        for item in items:
            if not item.image_path.is_file():
                raise ValueError(f"Catalog image does not exist: {item.image_path}")
            try:
                with Image.open(item.image_path) as opened:
                    opened.verify()
                with Image.open(item.image_path) as opened:
                    rows.append(embeddings.embed_image(opened.convert("RGB"))[0])
            except (UnidentifiedImageError, OSError, ValueError) as error:
                raise ValueError(f"Unable to process catalog image for {item.product_id}") from error
        matrix = l2_normalize(np.stack(rows))
        metadata = IndexMetadata(
            model=self.model,
            pretrained=self.pretrained,
            embedding_dimension=int(matrix.shape[1]),
            normalized=True,
            created_at=datetime.now(UTC).isoformat(),
            product_count=len(items),
        )
        self.directory.mkdir(parents=True, exist_ok=True)
        with (self.directory / "product_embeddings.npy").open("wb") as output:
            np.save(output, matrix, allow_pickle=False)
        (self.directory / "product_ids.json").write_text(json.dumps([item.product_id for item in items], indent=2) + "\n", encoding="utf-8")
        metadata_payload = {
            "model": metadata.model,
            "pretrained": metadata.pretrained,
            "embeddingDimension": metadata.embedding_dimension,
            "normalized": metadata.normalized,
            "createdAt": metadata.created_at,
            "productCount": metadata.product_count,
        }
        (self.directory / "index_metadata.json").write_text(json.dumps(metadata_payload, indent=2) + "\n", encoding="utf-8")
        self._accept(matrix, [item.product_id for item in items], metadata)
        return metadata

    def load(self) -> None:
        try:
            matrix = np.load(self.directory / "product_embeddings.npy", allow_pickle=False)
            ids_raw: Any = json.loads((self.directory / "product_ids.json").read_text(encoding="utf-8"))
            raw: Any = json.loads((self.directory / "index_metadata.json").read_text(encoding="utf-8"))
            if not isinstance(raw, dict):
                raise ValueError("Index metadata must be an object")
            metadata = IndexMetadata(
                model=raw["model"], pretrained=raw["pretrained"],
                embedding_dimension=raw["embeddingDimension"], normalized=raw["normalized"],
                created_at=raw["createdAt"], product_count=raw["productCount"],
            )
            self._accept(matrix, ids_raw, metadata)
            self.load_error = None
        except (OSError, EOFError, UnicodeError, ValueError, KeyError, TypeError, json.JSONDecodeError) as error:
            self.embeddings = None
            self.product_ids = []
            self.metadata = None
            self.load_error = str(error)
            raise ValueError(f"Catalog index is unavailable or invalid: {error}") from error

    def _accept(self, matrix: Any, product_ids: Any, metadata: IndexMetadata) -> None:
        if not isinstance(matrix, np.ndarray) or matrix.ndim != 2 or matrix.shape[0] == 0:
            raise ValueError("Embedding matrix must be a non-empty 2D NumPy array")
        if matrix.dtype.kind not in "fc" or not np.isfinite(matrix).all():
            raise ValueError("Embedding matrix must contain only finite floating-point values")
        if not isinstance(product_ids, list) or not all(isinstance(item, str) for item in product_ids):
            raise ValueError("Product IDs must be a JSON string array")
        if len(product_ids) != matrix.shape[0] or metadata.product_count != len(product_ids):
            raise ValueError("Product ID count does not match the embedding matrix")
        if len(set(product_ids)) != len(product_ids):
            raise ValueError("Product IDs must be unique")
        if metadata.embedding_dimension != matrix.shape[1]:
            raise ValueError("Metadata embedding dimension does not match the matrix")
        if metadata.model != self.model or metadata.pretrained != self.pretrained:
            raise ValueError("Index model metadata does not match configured OpenCLIP model")
        if metadata.normalized is not True or not np.allclose(np.linalg.norm(matrix, axis=1), 1.0, atol=1e-5):
            raise ValueError("Index embeddings must be L2-normalized")
        self.embeddings = np.asarray(matrix, dtype=np.float32)
        self.product_ids = product_ids
        self.metadata = metadata

    def search(self, query: NDArray[np.floating], limit: int) -> list[SearchResult]:
        if not self.loaded or self.embeddings is None:
            raise RuntimeError("Catalog index is not loaded")
        if not isinstance(limit, int) or isinstance(limit, bool) or limit < 1 or limit > len(self.product_ids):
            raise ValueError(f"topK must be an integer from 1 to {len(self.product_ids)}")
        return [SearchResult(rank + 1, self.product_ids[index], score) for rank, (index, score) in enumerate(top_k(query, self.embeddings, limit))]

    def status(self) -> dict[str, object]:
        return {
            "loaded": self.loaded,
            "productCount": len(self.product_ids),
            "embeddingDimension": self.metadata.embedding_dimension if self.metadata else None,
            "modelMatch": bool(self.metadata and self.metadata.model == self.model and self.metadata.pretrained == self.pretrained),
        }
