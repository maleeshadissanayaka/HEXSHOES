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

This phase provides model loading, text/image embedding, and text similarity only. There is no frontend or Express integration, catalog embedding index, vector database, image search workflow, batching queue, authentication, rate limiting, production model-cache policy, recommendation engine, forecasting, segmentation, evaluation dataset, or claimed retrieval quality. CPU inference is supported but can be slow, especially during initial model loading.
