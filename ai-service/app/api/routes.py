from io import BytesIO

from fastapi import APIRouter, File, Form, HTTPException, Query, Request, UploadFile
from fastapi.responses import JSONResponse
import numpy as np
from PIL import Image, UnidentifiedImageError

from app.schemas.api import ProductTextSearchRequest, TextEmbeddingRequest, TextSimilarityRequest, UserRecommendationRequest
from app.services.catalog_index_service import CatalogIndexService, SearchResult
from app.services.embedding_service import EmbeddingService
from app.services.similarity_service import top_k
from app.services.multimodal_service import fuse_multimodal_embeddings
from app.services.recommendation_service import Interaction, RecommendationService

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


def recommendations(request: Request) -> RecommendationService:
    return RecommendationService(catalog_index(request))


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
    return {"success": True, "service": "hexshoes-ai", "status": "healthy"}


@router.get("/status")
def status(request: Request) -> JSONResponse:
    clip = request.app.state.clip_model
    index_status = request.app.state.catalog_index.status()
    ready = clip.ready and bool(index_status["loaded"]) and bool(index_status["modelMatch"])
    return JSONResponse(status_code=200 if ready else 503, content={
        "success": ready,
        "data": {
            "service": "ready" if ready else "unavailable",
            "device": str(clip.device),
            "modelInitialization": clip.initialization_state,
            "model": clip.model_name,
            "pretrained": clip.pretrained,
            "catalogIndex": index_status,
        },
    })


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


@router.post("/search/multimodal")
async def search_multimodal(
    request: Request,
    image: UploadFile | None = File(default=None),
    text: str | None = Form(default=None),
    top_k_value: int = Form(default=4, alias="topK"),
    image_weight: float = Form(default=0.6, alias="imageWeight"),
    text_weight: float = Form(default=0.4, alias="textWeight"),
) -> dict[str, object]:
    query_text = text.strip() if text else None
    if image is None and not query_text:
        raise HTTPException(status_code=422, detail="At least one image or text query is required")
    image_embedding = service(request).embed_image(await validated_image(request, image))[0] if image else None
    text_embedding = service(request).embed_text(query_text)[0] if query_text else None
    try:
        combined = fuse_multimodal_embeddings(image_embedding, text_embedding, image_weight, text_weight)
        results = catalog_index(request).search(combined, top_k_value)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    mode = "image+text" if image is not None and query_text else "image" if image is not None else "text"
    return {"success": True, "data": {"queryType": "multimodal", "queryMode": mode, "results": result_payload(results)}}


@router.get("/recommend/similar/{product_id}")
def recommend_similar(product_id: str, request: Request, top_k_value: int = Query(default=3, alias="topK")) -> dict[str, object]:
    try:
        results = recommendations(request).similar(product_id, top_k_value)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    items = [{**item, "reasonCode": "SIMILAR_TO_CURRENT_PRODUCT"} for item in result_payload(results)]
    return {"success": True, "data": {"strategy": "clip-image-similarity", "results": items}}


@router.post("/recommend/user")
def recommend_user(payload: UserRecommendationRequest, request: Request) -> dict[str, object]:
    interactions = [Interaction(item.product_id, item.signal, item.weight) for item in payload.interactions]
    try:
        results = recommendations(request).recommend(interactions, payload.top_k)
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error)) from error
    items = [{"rank": item.rank, "productId": item.product_id, "score": item.score, "reasonCode": item.reason_code, "reasonProductId": item.reason_product_id} for item in results]
    return {"success": True, "data": {"strategy": "hybrid-content", "results": items}}
