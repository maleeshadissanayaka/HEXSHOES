from dataclasses import dataclass
import os

from dotenv import load_dotenv

load_dotenv()


@dataclass(frozen=True)
class Settings:
    host: str = os.getenv("AI_HOST", "127.0.0.1")
    port: int = int(os.getenv("AI_PORT", "8000"))
    model_name: str = os.getenv("CLIP_MODEL_NAME", "ViT-B-32")
    pretrained: str = os.getenv("CLIP_PRETRAINED", "laion2b_s34b_b79k")
    max_image_bytes: int = int(os.getenv("MAX_IMAGE_BYTES", str(5 * 1024 * 1024)))


settings = Settings()
