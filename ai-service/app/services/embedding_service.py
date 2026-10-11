from collections.abc import Sequence

import numpy as np
from PIL import Image
import torch

from app.models.clip_model import ClipModelService
from app.services.similarity_service import l2_normalize


class EmbeddingService:
    def __init__(self, clip: ClipModelService) -> None:
        self.clip = clip

    def embed_text(self, texts: str | Sequence[str]) -> np.ndarray:
        self.clip.require_ready()
        values = [texts] if isinstance(texts, str) else list(texts)
        if not values or any(not isinstance(value, str) or not value.strip() for value in values):
            raise ValueError("Text inputs must be non-empty strings")
        tokens = self.clip.tokenizer(values).to(self.clip.device)
        with torch.no_grad():
            features = self.clip.model.encode_text(tokens)
        return l2_normalize(features.float().cpu().numpy())

    def embed_image(self, image: Image.Image) -> np.ndarray:
        self.clip.require_ready()
        tensor = self.clip.preprocess(image.convert("RGB")).unsqueeze(0).to(self.clip.device)
        with torch.no_grad():
            features = self.clip.model.encode_image(tensor)
        return l2_normalize(features.float().cpu().numpy())
