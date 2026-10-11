from types import SimpleNamespace
from io import BytesIO
from pathlib import Path

from fastapi.testclient import TestClient
import numpy as np
from PIL import Image

from app.config import Settings
from app.main import create_app
from app.services.catalog_index_service import CatalogIndexService, IndexMetadata

TEST_SETTINGS = Settings(catalog_index_directory=Path("tests/nonexistent-index"))


class StubClip:
    model_name = "test-model"
    pretrained = "test-weights"
    device = "cpu"
    initialization_state = "not_initialized"
    ready = False

    def initialize(self) -> None:
        self.initialization_state = "ready"
        self.ready = True


class StubEmbeddings:
    def embed_text(self, values: str | list[str]) -> np.ndarray:
        count = 1 if isinstance(values, str) else len(values)
        vectors = np.array([[1.0, 0.0], [0.8, 0.6], [0.0, 1.0]], dtype=np.float32)
        return vectors[:count]

    def embed_image(self, _image: Image.Image) -> np.ndarray:
        return np.array([[0.6, 0.8]], dtype=np.float32)


def test_health_and_status_are_honest_after_successful_startup() -> None:
    app = create_app(TEST_SETTINGS, StubClip())  # type: ignore[arg-type]
    with TestClient(app) as client:
        assert client.get("/health").json() == {"success": True, "service": "hexshoes-ai", "status": "healthy"}
        status = client.get("/status").json()
        assert status["success"] is True
        assert status["data"] == {"service": "ready", "device": "cpu", "modelInitialization": "ready", "model": "test-model", "pretrained": "test-weights", "catalogIndex": {"loaded": False, "productCount": 0, "embeddingDimension": None, "modelMatch": False}}


def test_text_routes_return_metadata_not_raw_embeddings() -> None:
    app = create_app(TEST_SETTINGS, StubClip())  # type: ignore[arg-type]
    with TestClient(app) as client:
        app.state.embedding_service = StubEmbeddings()
        embedded = client.post("/embed/text", json={"text": "black running shoe"})
        assert embedded.status_code == 200
        assert embedded.json()["data"]["dimension"] == 2
        assert "embedding" not in embedded.json()["data"]
        ranked = client.post("/similarity/text", json={"query": "shoe", "candidates": ["sneaker", "boot"]})
        assert ranked.status_code == 200
        assert [item["candidate"] for item in ranked.json()["data"]["results"]] == ["sneaker", "boot"]


def test_validation_errors_do_not_invoke_model() -> None:
    app = create_app(TEST_SETTINGS, StubClip())  # type: ignore[arg-type]
    with TestClient(app) as client:
        app.state.embedding_service = SimpleNamespace()
        assert client.post("/embed/text", json={"text": " "}).status_code == 422
        assert client.post("/similarity/text", json={"query": "shoe", "candidates": []}).status_code == 422


def test_image_route_accepts_valid_images_without_storing_or_returning_vectors() -> None:
    image_bytes = BytesIO()
    Image.new("RGB", (2, 2), color="black").save(image_bytes, format="PNG")
    app = create_app(TEST_SETTINGS, StubClip())  # type: ignore[arg-type]
    with TestClient(app) as client:
        app.state.embedding_service = StubEmbeddings()
        response = client.post("/embed/image", files={"file": ("shoe.png", image_bytes.getvalue(), "image/png")})
        assert response.status_code == 200
        assert response.json()["data"]["accepted"] is True
        assert response.json()["data"]["norm"] == 1.0
        assert "embedding" not in response.json()["data"]


def test_image_route_rejects_invalid_and_oversized_uploads() -> None:
    invalid_app = create_app(TEST_SETTINGS, StubClip())  # type: ignore[arg-type]
    with TestClient(invalid_app) as client:
        assert client.post("/embed/image", files={"file": ("bad.png", b"not an image", "image/png")}).status_code == 400
    limited_app = create_app(Settings(max_image_bytes=3, catalog_index_directory=Path("tests/nonexistent-index")), StubClip())  # type: ignore[arg-type]
    with TestClient(limited_app) as client:
        assert client.post("/embed/image", files={"file": ("large.png", b"1234", "image/png")}).status_code == 413


def test_product_search_endpoints_rank_known_normalized_vectors() -> None:
    app = create_app(TEST_SETTINGS, StubClip())  # type: ignore[arg-type]
    with TestClient(app) as client:
        app.state.embedding_service = StubEmbeddings()
        index = CatalogIndexService(TEST_SETTINGS.catalog_index_directory, "ViT-B-32", "laion2b_s34b_b79k")
        index._accept(
            np.array([[1.0, 0.0], [0.0, 1.0]], dtype=np.float32),
            ["hx-01", "hx-02"],
            IndexMetadata("ViT-B-32", "laion2b_s34b_b79k", 2, True, "2026-01-01T00:00:00+00:00", 2),
        )
        app.state.catalog_index = index
        text = client.post("/search/text", json={"query": "running shoe", "topK": 2})
        assert text.status_code == 200
        assert [item["productId"] for item in text.json()["data"]["results"]] == ["hx-01", "hx-02"]
        image_bytes = BytesIO()
        Image.new("RGB", (2, 2), color="black").save(image_bytes, format="PNG")
        image = client.post("/search/image", files={"image": ("shoe.png", image_bytes.getvalue(), "image/png")}, data={"topK": "2"})
        assert image.status_code == 200
        assert image.json()["data"]["results"][0]["productId"] == "hx-02"
        assert client.post("/search/text", json={"query": "shoe", "topK": 3}).status_code == 422


def test_recommendation_and_multimodal_endpoints() -> None:
    app = create_app(TEST_SETTINGS, StubClip())  # type: ignore[arg-type]
    with TestClient(app) as client:
        app.state.embedding_service = StubEmbeddings()
        index = CatalogIndexService(TEST_SETTINGS.catalog_index_directory, "ViT-B-32", "laion2b_s34b_b79k")
        index._accept(
            np.array([[1.0, 0.0], [0.8, 0.6], [0.0, 1.0], [-1.0, 0.0]], dtype=np.float32),
            ["hx-01", "hx-02", "hx-03", "hx-04"],
            IndexMetadata("ViT-B-32", "laion2b_s34b_b79k", 2, True, "2026-01-01T00:00:00+00:00", 4),
        )
        app.state.catalog_index = index
        similar = client.get("/recommend/similar/hx-01?topK=2")
        assert similar.status_code == 200
        assert [item["productId"] for item in similar.json()["data"]["results"]] == ["hx-02", "hx-03"]
        user = client.post("/recommend/user", json={"interactions": [{"productId": "hx-01", "signal": "wishlist", "weight": 1.0}], "topK": 3})
        assert user.status_code == 200
        assert all(item["productId"] != "hx-01" for item in user.json()["data"]["results"])
        image_bytes = BytesIO()
        Image.new("RGB", (2, 2), color="black").save(image_bytes, format="PNG")
        multimodal = client.post("/search/multimodal", files={"image": ("shoe.png", image_bytes.getvalue(), "image/png")}, data={"text": "trail", "topK": "2"})
        assert multimodal.status_code == 200
        assert multimodal.json()["data"]["queryMode"] == "image+text"
        assert client.post("/search/multimodal", data={"topK": "2"}).status_code == 422
