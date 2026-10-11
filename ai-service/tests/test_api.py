from types import SimpleNamespace
from io import BytesIO

from fastapi.testclient import TestClient
import numpy as np
from PIL import Image

from app.config import Settings
from app.main import create_app


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
    app = create_app(Settings(), StubClip())  # type: ignore[arg-type]
    with TestClient(app) as client:
        assert client.get("/health").json() == {"success": True, "service": "hexshoes-ai", "status": "healthy"}
        status = client.get("/status").json()
        assert status["success"] is True
        assert status["data"] == {"service": "ready", "device": "cpu", "modelInitialization": "ready", "model": "test-model", "pretrained": "test-weights"}


def test_text_routes_return_metadata_not_raw_embeddings() -> None:
    app = create_app(Settings(), StubClip())  # type: ignore[arg-type]
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
    app = create_app(Settings(), StubClip())  # type: ignore[arg-type]
    with TestClient(app) as client:
        app.state.embedding_service = SimpleNamespace()
        assert client.post("/embed/text", json={"text": " "}).status_code == 422
        assert client.post("/similarity/text", json={"query": "shoe", "candidates": []}).status_code == 422


def test_image_route_accepts_valid_images_without_storing_or_returning_vectors() -> None:
    image_bytes = BytesIO()
    Image.new("RGB", (2, 2), color="black").save(image_bytes, format="PNG")
    app = create_app(Settings(), StubClip())  # type: ignore[arg-type]
    with TestClient(app) as client:
        app.state.embedding_service = StubEmbeddings()
        response = client.post("/embed/image", files={"file": ("shoe.png", image_bytes.getvalue(), "image/png")})
        assert response.status_code == 200
        assert response.json()["data"]["accepted"] is True
        assert response.json()["data"]["norm"] == 1.0
        assert "embedding" not in response.json()["data"]


def test_image_route_rejects_invalid_and_oversized_uploads() -> None:
    invalid_app = create_app(Settings(), StubClip())  # type: ignore[arg-type]
    with TestClient(invalid_app) as client:
        assert client.post("/embed/image", files={"file": ("bad.png", b"not an image", "image/png")}).status_code == 400
    limited_app = create_app(Settings(max_image_bytes=3), StubClip())  # type: ignore[arg-type]
    with TestClient(limited_app) as client:
        assert client.post("/embed/image", files={"file": ("large.png", b"1234", "image/png")}).status_code == 413
