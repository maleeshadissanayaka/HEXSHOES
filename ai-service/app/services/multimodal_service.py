import numpy as np
from numpy.typing import NDArray

from app.services.similarity_service import l2_normalize


def fuse_multimodal_embeddings(
    image: NDArray[np.floating] | None,
    text: NDArray[np.floating] | None,
    image_weight: float = 0.6,
    text_weight: float = 0.4,
) -> NDArray[np.float32]:
    if image is None and text is None:
        raise ValueError("At least one query modality is required")
    if image is None:
        return l2_normalize(text)[0]  # type: ignore[arg-type]
    if text is None:
        return l2_normalize(image)[0]
    if not np.isfinite([image_weight, text_weight]).all() or image_weight <= 0 or text_weight <= 0:
        raise ValueError("Multimodal weights must be finite positive numbers")
    image_vector, text_vector = l2_normalize(image)[0], l2_normalize(text)[0]
    if image_vector.shape != text_vector.shape:
        raise ValueError("Image and text embeddings must have the same dimension")
    total = image_weight + text_weight
    return l2_normalize((image_weight / total) * image_vector + (text_weight / total) * text_vector)[0]
