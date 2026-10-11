from dataclasses import dataclass
import os

from dotenv import load_dotenv
from pathlib import Path

load_dotenv()

SERVICE_ROOT = Path(__file__).resolve().parents[1]


@dataclass(frozen=True)
class Settings:
    host: str = os.getenv("AI_HOST", "127.0.0.1")
    port: int = int(os.getenv("AI_PORT", "8000"))
    model_name: str = os.getenv("CLIP_MODEL_NAME", "ViT-B-32")
    pretrained: str = os.getenv("CLIP_PRETRAINED", "laion2b_s34b_b79k")
    max_image_bytes: int = int(os.getenv("MAX_IMAGE_BYTES", str(5 * 1024 * 1024)))
    catalog_manifest: Path = Path(os.getenv("CATALOG_MANIFEST", str(SERVICE_ROOT / "data" / "catalog.json")))
    catalog_index_directory: Path = Path(os.getenv("CATALOG_INDEX_DIRECTORY", str(SERVICE_ROOT / "data" / "embeddings")))


settings = Settings()
