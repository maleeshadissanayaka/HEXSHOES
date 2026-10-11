from typing import Literal

from pydantic import BaseModel, Field, StrictInt, field_validator


class TextEmbeddingRequest(BaseModel):
    text: str = Field(min_length=1, max_length=1000)

    @field_validator("text")
    @classmethod
    def text_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("text must not be blank")
        return value.strip()


class TextSimilarityRequest(BaseModel):
    query: str = Field(min_length=1, max_length=1000)
    candidates: list[str] = Field(min_length=1, max_length=100)
    top_k: int | None = Field(default=None, ge=1, le=100)

    @field_validator("query")
    @classmethod
    def query_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("query must not be blank")
        return value.strip()

    @field_validator("candidates")
    @classmethod
    def candidates_must_not_be_blank(cls, values: list[str]) -> list[str]:
        if any(not value.strip() for value in values):
            raise ValueError("candidates must not contain blank text")
        return [value.strip() for value in values]


class ProductTextSearchRequest(BaseModel):
    query: str = Field(min_length=1, max_length=1000)
    top_k: StrictInt = Field(default=4, alias="topK", ge=1)

    @field_validator("query")
    @classmethod
    def query_must_not_be_blank(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("query must not be blank")
        return value.strip()


class RecommendationInteraction(BaseModel):
    product_id: str = Field(alias="productId", min_length=1)
    signal: Literal["wishlist", "cart"]
    weight: float = Field(gt=0)


class UserRecommendationRequest(BaseModel):
    interactions: list[RecommendationInteraction] = Field(min_length=1, max_length=8)
    top_k: StrictInt = Field(default=3, alias="topK", ge=1)
