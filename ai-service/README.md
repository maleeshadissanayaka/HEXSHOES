# HEXSHOES AI Service

Foundation-only FastAPI microservice for real OpenCLIP text and image embeddings and cosine-similarity ranking. It is not connected to the storefront yet and makes no accuracy, confidence, recommendation, forecasting, or segmentation claims.

## Architecture

```text
app/
|-- api/routes.py                 # HTTP endpoints and upload validation
|-- config.py                     # environment-backed settings
|-- main.py                       # FastAPI factory and model lifespan
|-- models/clip_model.py          # single reusable OpenCLIP loader
|-- schemas/api.py                # Pydantic request validation
`-- services/
    |-- embedding_service.py      # text/image encoding and normalization
    |-- catalog_index_service.py  # manifest, persisted index, validation, search
    `-- similarity_service.py     # cosine scores and top-k ranking
```

The production app loads one model during FastAPI startup, selects CUDA when PyTorch reports it available and otherwise uses CPU, calls `eval()`, and uses `torch.no_grad()` for inference. Startup fails clearly if the configured weights cannot load; there is no random or fake embedding fallback.

## Windows PowerShell setup

Python 3.11 is preferred when available; Python 3.12 is supported by these dependencies.

```powershell
cd E:\HEXSHOES\ai-service
py -3.12 -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

If a compatible CPU-only PyTorch installation already exists on the machine, `py -3.12 -m venv --system-site-packages .venv` can reuse it while keeping service-specific packages local. The requirements retain bounded compatibility ranges for PyTorch, torchvision, NumPy, and Pillow.

No secrets are required for local OpenCLIP inference. `.env`, `.venv`, model/download caches, Python bytecode, and pytest caches are ignored by Git.

## Configuration

| Variable | Default |
| --- | --- |
| `AI_HOST` | `127.0.0.1` |
| `AI_PORT` | `8000` |
| `CLIP_MODEL_NAME` | `ViT-B-32` |
| `CLIP_PRETRAINED` | `laion2b_s34b_b79k` |
| `MAX_IMAGE_BYTES` | `5242880` (5 MiB) |
| `CATALOG_MANIFEST` | `./data/catalog.json` |
| `CATALOG_INDEX_DIRECTORY` | `./data/embeddings` |

The model/weights pairing follows the OpenCLIP project’s documented usage. The first real startup downloads model weights to the dependency’s normal user cache and therefore requires network access. Later starts reuse that cache.

## Run

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

Development reload is optional:

```powershell
.\.venv\Scripts\python.exe -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

## API

- `GET /` — service identity
- `GET /health` — healthy only after model initialization succeeds
- `GET /status` — device, initialization state, model name, and pretrained identifier
- `POST /embed/text` — normalized text-embedding dimension and norm; does not expose the vector
- `POST /similarity/text` — real text embedding and ranked cosine similarity scores
- `POST /embed/image` — validates an in-memory image up to the configured limit and returns normalized embedding metadata; the image is not stored
- `POST /search/image` — embeds an uploaded image and ranks indexed product IDs; multipart fields are `image` and optional `topK`
- `POST /search/text` — embeds text and ranks the same indexed product images; JSON fields are `query` and optional `topK`

Example text embedding request:

```json
{ "text": "black running shoe" }
```

Example similarity request:

```json
{
  "query": "black running shoe",
  "candidates": ["black sports sneaker", "red high heel", "brown leather formal shoe"]
}
```

Text and image feature vectors are converted to float32 NumPy arrays and L2-normalized. For normalized vectors, the dot product is cosine similarity. Returned values are **similarity scores**, not probabilities or confidence estimates.

## Catalog image index

`data/catalog.json` maps only canonical product IDs to portable repository-relative image paths. Product names, prices, categories, and other canonical metadata remain owned by the backend/Firestore catalog. Phase 2 uses the 960×960 primary image recorded by the canonical catalog for each product:

| Product | Retrieval image |
| --- | --- |
| `hx-01` | `frontend/public/media/presentation/runner-960.webp` |
| `hx-02` | `frontend/public/media/presentation/trail-960.webp` |
| `hx-03` | `frontend/public/media/presentation/slide-960.webp` |
| `hx-04` | `frontend/public/media/presentation/mono-960.webp` |

Build or rebuild the index after any manifest or source-image change:

```powershell
.\.venv\Scripts\python.exe -m scripts.build_catalog_index
```

The command safely decodes every required image, creates real normalized OpenCLIP image embeddings, and writes:

- `data/embeddings/product_embeddings.npy` — ordered float32 matrix
- `data/embeddings/product_ids.json` — product ID order
- `data/embeddings/index_metadata.json` — model, weights, dimension, normalization, timestamp, and product count

The files are small (about 8.6 KiB total for four products), reproducible, useful for immediate service startup, and intentionally committed. The loader rejects non-finite, corrupt, unnormalized, dimension-mismatched, count-mismatched, or wrong-model indexes. The matrix loads once during application startup and is reused. For four products, an in-memory NumPy matrix is clearer and sufficient; FAISS or another vector database would add operational complexity without benefit.

Search `topK` must be an integer from 1 through the loaded product count and defaults to 4. Responses contain only rank, product ID, and cosine similarity score. Uploaded query images are validated in memory and never persisted.

Run the reproducible evaluation report with:

```powershell
.\.venv\Scripts\python.exe -m scripts.evaluate_catalog_index
```

This uses each indexed image as its own query and reports Top-1 and Top-K **exact-image self-retrieval sanity checks**. It is not held-out evaluation and does not measure production accuracy or generalization.

## Tests

The default suite uses dependency-boundary stubs for route behavior and does not download or reload OpenCLIP:

```powershell
.\.venv\Scripts\python.exe -m pytest -m "not model_integration"
```

Run the separately marked real-model smoke test with:

```powershell
.\.venv\Scripts\python.exe -m pytest -m model_integration
```

## Current limitations

This phase provides model loading, text/image embedding, a four-product local image index, and real image/text retrieval. There is no frontend or Express integration, vector database, held-out retrieval dataset, batching queue, authentication, rate limiting, production model-cache policy, recommendation engine, forecasting, segmentation, or claimed production retrieval quality. The presentation catalog has only one image per product, so self-retrieval cannot measure generalization. CPU inference is supported but can be slow, especially during initial model loading.
