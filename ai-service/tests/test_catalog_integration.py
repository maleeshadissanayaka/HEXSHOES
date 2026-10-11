from pathlib import Path

import numpy as np
from PIL import Image
import pytest

from app.config import settings
from app.models.clip_model import ClipModelService
from app.services.catalog_index_service import CatalogIndexService, load_manifest
from app.services.embedding_service import EmbeddingService


@pytest.mark.model_integration
def test_real_catalog_build_and_exact_image_self_retrieval(tmp_path: Path) -> None:
    clip = ClipModelService(settings.model_name, settings.pretrained)
    clip.initialize()
    embeddings = EmbeddingService(clip)
    index = CatalogIndexService(tmp_path, settings.model_name, settings.pretrained)
    metadata = index.build(settings.catalog_manifest, embeddings)
    assert index.embeddings is not None
    assert index.embeddings.shape == (4, 512)
    assert np.isfinite(index.embeddings).all()
    np.testing.assert_allclose(np.linalg.norm(index.embeddings, axis=1), np.ones(4), atol=1e-5)
    assert metadata.product_count == 4
    assert metadata.model == settings.model_name
    assert metadata.pretrained == settings.pretrained
    for item in load_manifest(settings.catalog_manifest):
        with Image.open(item.image_path) as image:
            result = index.search(embeddings.embed_image(image.convert("RGB"))[0], 1)[0]
        assert result.product_id == item.product_id
