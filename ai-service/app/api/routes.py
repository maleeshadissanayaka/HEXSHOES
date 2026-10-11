from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, Request, UploadFile
import numpy as np
from PIL import Image, UnidentifiedImageError

from app.schemas.api import ProductTextSearchRequest, TextEmbeddingRequest, TextSimilarityRequest
from app.services.catalog_index_service import CatalogIndexService, SearchResult
from app.services.embedding_service import EmbeddingService
from app.services.similarity_service import top_k

router = APIRouter()


def service(request: Request) -> EmbeddingService:
    return request.app.state.embedding_service


def metadata(request: Request) -> dict[str, str]:
    clip = request.app.state.clip_model
    return {"model": clip.model_name, "pretrained": clip.pretrained, "device": str(clip.device)}


def catalog_index(request: Request) -> CatalogIndexService:
    index = request.app.state.catalog_index
    if not index.loaded:
        raise HTTPException(status_code=503, detail="Catalog index is not loaded")
    return index


def result_payload(results: list[SearchResult]) -> list[dict[str, object]]:
    return [{"rank": item.rank, "productId": item.product_id, "similarityScore": item.similarity_score} for item in results]


async def validated_image(request: Request, file: UploadFile) -> Image.Image:
    content = await file.read(request.app.state.settings.max_image_bytes + 1)
    if len(content) > request.app.state.settings.max_image_bytes:
        raise HTTPException(status_code=413, detail="Image exceeds the configured size limit")
    try:
        with Image.open(BytesIO(content)) as opened:
            opened.verify()
        with Image.open(BytesIO(content)) as opened:
            return opened.convert("RGB")
    except (UnidentifiedImageError, OSError, ValueError) as error:
        raise HTTPException(status_code=400, detail="Uploaded file is not a valid supported image") from error


@router.get("/")
def root() -> dict[str, object]:
    return {"success": True, "service": "hexshoes-ai", "message": "HEXSHOES AI Service"}


@router.get("/health")
def health(request: Request) -> dict[str, object]:
    ready = request.app.state.clip_model.ready
    return {"success": ready, "service": "hexshoes-ai", "status": "healthy" if ready else "unavailable"}


@router.get("/status")
def status(request: Request) -> dict[str, object]:
    clip = request.app.state.clip_model
    return {
        "success": clip.ready,
        "data": {
            "service": "ready" if clip.ready else "unavailable",
            "device": str(clip.device),
            "modelInitialization": clip.initialization_state,
            "model": clip.model_name,
            "pretrained": clip.pretrained,
            "catalogIndex": request.app.state.catalog_index.status(),
        },
    }


@router.post("/embed/text")
def embed_text(payload: TextEmbeddingRequest, request: Request) -> dict[str, object]:
    embedding = service(request).embed_text(payload.text)[0]
    return {"success": True, "data": {"dimension": len(embedding), "norm": float(np.linalg.norm(embedding)), **metadata(request)}}


@router.post("/similarity/text")
def similarity_text(payload: TextSimilarityRequest, request: Request) -> dict[str, object]:
    embeddings = service(request).embed_text([payload.query, *payload.candidates])
    ranking = top_k(embeddings[0], embeddings[1:], payload.top_k or len(payload.candidates))
    results = [{"candidate": payload.candidates[index], "similarityScore": score} for index, score in ranking]
    return {"success": True, "data": {"results": results, **metadata(request)}}


@router.post("/embed/image")
async def embed_image(request: Request, file: UploadFile = File(...)) -> dict[str, object]:
    embedding = service(request).embed_image(await validated_image(request, file))[0]
    return {"success": True, "data": {"accepted": True, "dimension": len(embedding), "norm": float(np.linalg.norm(embedding)), **metadata(request)}}


@router.post("/search/image")
async def search_image(request: Request, image: UploadFile = File(...), top_k_value: int = Form(default=4, alias="topK")) -> dict[str, object]:
    index = catalog_index(request)
    try:
        results = index.search(service(request).embed_image(await validated_image(request, image))[0], top_k_value)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return {"success": True, "data": {"queryType": "image", "model": index.model, "pretrained": index.pretrained, "results": result_payload(results)}}


@router.post("/search/text")
def search_text(payload: ProductTextSearchRequest, request: Request) -> dict[str, object]:
    index = catalog_index(request)
    try:
        results = index.search(service(request).embed_text(payload.query)[0], payload.top_k)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    return {"success": True, "data": {"queryType": "text", "model": index.model, "pretrained": index.pretrained, "results": result_payload(results)}}
