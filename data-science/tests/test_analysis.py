import numpy as np

from evaluation.analysis import cosine_similarity_matrix, pca_projection


def test_similarity_matrix_is_symmetric_with_unit_diagonal() -> None:
    matrix = cosine_similarity_matrix(np.array([[1.0, 0.0], [0.0, 1.0], [1.0, 1.0]]))
    assert np.allclose(matrix, matrix.T)
    assert np.allclose(np.diag(matrix), 1.0)


def test_pca_has_expected_shape_and_is_deterministic() -> None:
    values = np.array([[1.0, 0.0, 0.0], [0.0, 1.0, 0.0], [0.0, 0.0, 1.0]])
    first, variance = pca_projection(values)
    second, _ = pca_projection(values)
    assert first.shape == (3, 2)
    assert variance.shape == (2,)
    assert np.allclose(first, second)
