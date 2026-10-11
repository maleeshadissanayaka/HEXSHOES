from __future__ import annotations

import numpy as np
from numpy.typing import NDArray
from sklearn.decomposition import PCA


def cosine_similarity_matrix(embeddings: NDArray[np.floating]) -> NDArray[np.float64]:
    values = np.asarray(embeddings, dtype=np.float64)
    if values.ndim != 2 or values.shape[0] < 2 or values.shape[1] < 1 or not np.isfinite(values).all():
        raise ValueError("embeddings must be a finite 2D matrix with at least two rows")
    norms = np.linalg.norm(values, axis=1, keepdims=True)
    if np.any(norms == 0):
        raise ValueError("embeddings must be non-zero")
    normalized = values / norms
    return normalized @ normalized.T


def pca_projection(embeddings: NDArray[np.floating]) -> tuple[NDArray[np.float64], NDArray[np.float64]]:
    values = np.asarray(embeddings, dtype=np.float64)
    if values.ndim != 2 or values.shape[0] < 2 or values.shape[1] < 2 or not np.isfinite(values).all():
        raise ValueError("PCA requires a finite 2D matrix with at least two rows and columns")
    model = PCA(n_components=2, svd_solver="full")
    coordinates = model.fit_transform(values)
    return coordinates, model.explained_variance_ratio_
