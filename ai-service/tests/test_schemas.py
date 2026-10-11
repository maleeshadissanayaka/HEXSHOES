import pytest
from pydantic import ValidationError

from app.schemas.api import ProductTextSearchRequest, TextEmbeddingRequest, TextSimilarityRequest


def test_embedding_schema_trims_text() -> None:
    assert TextEmbeddingRequest(text="  black running shoe  ").text == "black running shoe"


def test_similarity_schema_validates_candidates_and_top_k() -> None:
    parsed = TextSimilarityRequest(query=" shoe ", candidates=[" sneaker ", "boot"], top_k=1)
    assert parsed.query == "shoe"
    assert parsed.candidates == ["sneaker", "boot"]
    with pytest.raises(ValidationError):
        TextSimilarityRequest(query="shoe", candidates=[" "])
    with pytest.raises(ValidationError):
        TextSimilarityRequest(query="shoe", candidates=["boot"], top_k=0)


def test_product_search_top_k_is_a_strict_positive_integer() -> None:
    assert ProductTextSearchRequest(query="shoe").top_k == 4
    for value in (0, 1.5, True, "2"):
        with pytest.raises(ValidationError):
            ProductTextSearchRequest(query="shoe", topK=value)  # type: ignore[arg-type]
