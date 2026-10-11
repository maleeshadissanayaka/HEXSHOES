import numpy as np
import pytest

from app.config import settings
from app.models.clip_model import ClipModelService
from app.services.embedding_service import EmbeddingService


@pytest.mark.model_integration
def test_real_openclip_text_embedding() -> None:
    clip = ClipModelService(settings.model_name, settings.pretrained)
    clip.initialize()
    embedding = EmbeddingService(clip).embed_text("black running shoe")
    assert embedding.shape[0] == 1
    assert embedding.shape[1] > 0
    assert np.isfinite(embedding).all()
    assert np.linalg.norm(embedding[0]) == pytest.approx(1.0, abs=1e-5)
