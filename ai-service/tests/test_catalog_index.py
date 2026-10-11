import json
from pathlib import Path

import numpy as np
import pytest

from app.services.catalog_index_service import CatalogIndexService, IndexMetadata, load_manifest


def write_manifest(path: Path, items: object) -> Path:
    path.write_text(json.dumps(items), encoding="utf-8")
    return path


def test_manifest_requires_each_canonical_product_once(tmp_path: Path) -> None:
    valid = [{"productId": f"hx-0{number}", "imagePath": f"image-{number}.webp"} for number in range(1, 5)]
    assert [item.product_id for item in load_manifest(write_manifest(tmp_path / "valid.json", valid))] == ["hx-01", "hx-02", "hx-03", "hx-04"]
    with pytest.raises(ValueError, match="each canonical product"):
        load_manifest(write_manifest(tmp_path / "missing.json", valid[:3]))
    invalid = [*valid[:3], {"productId": "invented", "imagePath": "x.webp"}]
    with pytest.raises(ValueError, match="Unknown canonical product"):
        load_manifest(write_manifest(tmp_path / "invalid.json", invalid))


def test_manifest_rejects_paths_outside_repository_boundary(tmp_path: Path) -> None:
    manifest_dir = tmp_path / "repo" / "ai-service" / "data"
    manifest_dir.mkdir(parents=True)
    items = [{"productId": f"hx-0{number}", "imagePath": "../../../../outside.webp"} for number in range(1, 5)]
    with pytest.raises(ValueError, match="escapes the repository"):
        load_manifest(write_manifest(manifest_dir / "catalog.json", items))


def save_index(directory: Path, matrix: np.ndarray, ids: list[str], metadata: dict[str, object]) -> CatalogIndexService:
    directory.mkdir()
    np.save(directory / "product_embeddings.npy", matrix, allow_pickle=False)
    (directory / "product_ids.json").write_text(json.dumps(ids), encoding="utf-8")
    (directory / "index_metadata.json").write_text(json.dumps(metadata), encoding="utf-8")
    return CatalogIndexService(directory, "model", "weights")


def metadata(rows: int, dimensions: int = 2) -> dict[str, object]:
    return {"model": "model", "pretrained": "weights", "embeddingDimension": dimensions, "normalized": True, "createdAt": "2026-01-01T00:00:00+00:00", "productCount": rows}


def test_loader_validates_metadata_and_ranks_deterministically(tmp_path: Path) -> None:
    index = save_index(tmp_path / "valid", np.array([[1.0, 0.0], [0.0, 1.0]], dtype=np.float32), ["hx-01", "hx-02"], metadata(2))
    index.load()
    results = index.search(np.array([0.9, 0.1], dtype=np.float32), 2)
    assert [(item.rank, item.product_id) for item in results] == [(1, "hx-01"), (2, "hx-02")]
    assert index.status() == {"loaded": True, "productCount": 2, "embeddingDimension": 2, "modelMatch": True}


@pytest.mark.parametrize(
    ("matrix", "ids", "meta", "message"),
    [
        (np.array([[np.nan, 0.0]], dtype=np.float32), ["hx-01"], metadata(1), "finite"),
        (np.array([[1.0, 0.0]], dtype=np.float32), ["hx-01", "hx-02"], metadata(2), "count"),
        (np.array([[1.0, 0.0]], dtype=np.float32), ["hx-01"], metadata(1, 3), "dimension"),
        (np.array([[2.0, 0.0]], dtype=np.float32), ["hx-01"], metadata(1), "normalized"),
    ],
)
def test_loader_rejects_corrupt_or_mismatched_index(tmp_path: Path, matrix: np.ndarray, ids: list[str], meta: dict[str, object], message: str) -> None:
    index = save_index(tmp_path / message, matrix, ids, meta)
    with pytest.raises(ValueError, match=message):
        index.load()


def test_model_metadata_and_top_k_are_validated(tmp_path: Path) -> None:
    wrong = metadata(1)
    wrong["model"] = "other"
    index = save_index(tmp_path / "wrong", np.array([[1.0, 0.0]], dtype=np.float32), ["hx-01"], wrong)
    with pytest.raises(ValueError, match="model metadata"):
        index.load()
    valid = CatalogIndexService(tmp_path, "model", "weights")
    valid._accept(np.array([[1.0, 0.0]], dtype=np.float32), ["hx-01"], IndexMetadata("model", "weights", 2, True, "now", 1))
    for value in (0, 2, 1.5, True):
        with pytest.raises(ValueError, match="topK"):
            valid.search(np.array([1.0, 0.0], dtype=np.float32), value)  # type: ignore[arg-type]
