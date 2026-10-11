from __future__ import annotations

from threading import Lock
from typing import Any

import open_clip
import torch


class ClipModelService:
    """Loads and owns one reusable OpenCLIP model instance."""

    def __init__(self, model_name: str, pretrained: str) -> None:
        self.model_name = model_name
        self.pretrained = pretrained
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model: Any | None = None
        self.preprocess: Any | None = None
        self.tokenizer: Any | None = None
        self.initialization_state = "not_initialized"
        self.initialization_error: str | None = None
        self._lock = Lock()

    def initialize(self) -> None:
        if self.model is not None:
            return
        with self._lock:
            if self.model is not None:
                return
            self.initialization_state = "initializing"
            try:
                model, _, preprocess = open_clip.create_model_and_transforms(
                    self.model_name,
                    pretrained=self.pretrained,
                    device=self.device,
                )
                model.eval()
                self.model = model
                self.preprocess = preprocess
                self.tokenizer = open_clip.get_tokenizer(self.model_name)
                self.initialization_state = "ready"
                self.initialization_error = None
            except Exception as error:
                self.initialization_state = "failed"
                self.initialization_error = str(error)
                raise RuntimeError(
                    f"OpenCLIP initialization failed for {self.model_name}/{self.pretrained}"
                ) from error

    @property
    def ready(self) -> bool:
        return self.initialization_state == "ready" and self.model is not None

    def require_ready(self) -> None:
        if not self.ready or self.preprocess is None or self.tokenizer is None:
            raise RuntimeError("OpenCLIP model is not initialized")
