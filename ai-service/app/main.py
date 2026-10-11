from collections.abc import AsyncIterator
from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import router
from app.config import Settings, settings
from app.models.clip_model import ClipModelService
from app.services.embedding_service import EmbeddingService


def create_app(app_settings: Settings = settings, clip_model: ClipModelService | None = None) -> FastAPI:
    clip = clip_model or ClipModelService(app_settings.model_name, app_settings.pretrained)

    @asynccontextmanager
    async def lifespan(application: FastAPI) -> AsyncIterator[None]:
        clip.initialize()
        application.state.clip_model = clip
        application.state.embedding_service = EmbeddingService(clip)
        application.state.settings = app_settings
        yield

    application = FastAPI(title="HEXSHOES AI Service", version="0.1.0", lifespan=lifespan)
    application.include_router(router)
    return application


app = create_app()
