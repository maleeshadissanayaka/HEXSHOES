# HEXSHOES

AI-Powered Retail Intelligence & Footwear Discovery Platform

HEXSHOES is a planned footwear discovery and retail intelligence platform with two goals: demonstrate practical Data Science and Software Engineering skills, and establish a foundation for a future footwear e-commerce business.

## Local Development

The root developer workflow starts the React frontend, Express backend, and FastAPI AI service together with labeled output. It is designed for Windows PowerShell and does not install dependencies or create environment files automatically.

### One-time setup

From the repository root:

```powershell
npm install
npm --prefix frontend install
npm --prefix backend install
py -3.11 -m venv ai-service/.venv
ai-service\.venv\Scripts\python.exe -m pip install -r ai-service\requirements.txt
```

Keep the required local configuration in `frontend/.env` and `backend/.env`. Keep `ai-service/.env` only when overriding its documented defaults. These files are ignored and must not be committed or overwritten by the startup workflow.

If `ai-service/.venv` is missing, AI startup fails visibly. Create the virtual environment and install `ai-service/requirements.txt`; startup never installs Python packages silently.

### Daily startup

```powershell
npm run dev
```

This starts:

- Frontend: `http://127.0.0.1:5173`
- Backend: `http://127.0.0.1:5000`
- AI service: `http://127.0.0.1:8000`

Check all three from another terminal with `npm run health`. Stop the coordinated development process with `Ctrl+C`; the runner forwards shutdown to every child service.

Individual services can also be started from the repository root:

```powershell
npm run dev:frontend
npm run dev:backend
npm run dev:ai
```

## Problem

Footwear shoppers often struggle to find products that match their visual preferences. Retailers also need ways to turn catalog and customer data into useful merchandising and business decisions. HEXSHOES aims to connect product discovery with evidence-based retail intelligence.

## Vision

Build a retail-first experience with premium editorial presentation, responsive layouts, strong typography, large product photography, and subtle motion. The visual direction combines black, charcoal, and off-white with a restrained electric blue accent.

The platform will grow in stages, beginning with a dependable software foundation and later introducing measurable, explainable intelligence. Planned capabilities described here are not implemented.

## Planned technology stack

| Area | Technologies and purpose |
| --- | --- |
| Frontend | React, TypeScript, Vite; responsive footwear shopping experience |
| Backend | Node.js, Express, TypeScript; REST APIs |
| Data platform | Firebase Firestore and Firebase Authentication |
| AI service | Python, FastAPI, PyTorch, OpenCLIP / CLIP |
| Visual retrieval | Image embeddings and cosine similarity retrieval |
| Data Science | Catalog exploration, experimentation, evaluation, and future retail intelligence |

## Planned architecture

```text
React + TypeScript
        ↓
Node.js + Express API
        ↓
Firebase Firestore / Auth

React
        ↓
FastAPI AI Service
        ↓
PyTorch + OpenCLIP

Future intelligence layer:
recommendations · segmentation · forecasting · analytics · AI agent
```

The backend is planned to provide retail APIs and integrate with Firebase. The AI service is planned as a separate Python service for embedding generation and similarity retrieval. Authentication, authorization, service boundaries, and deployment details will be defined during subsequent phases.

## AI / ML / DL / Data Science direction

The initial AI direction is visual footwear discovery using CLIP-based deep learning image embeddings and cosine similarity. Later work may extend retrieval to multimodal search and introduce recommendation systems, customer segmentation, retail analytics, demand forecasting, explainable AI, recommendation evaluation, and an AI shopping assistant / agent.

Experiments will distinguish measured results from assumptions and document data quality, evaluation methods, and limitations. No model, metric, or intelligence module exists in Phase 0.

## Repository structure

```text
HEXSHOES/
├── frontend/       # Future React application
├── backend/        # Future Express REST API
├── ai-service/     # Future FastAPI and embedding service
├── catalog/        # Future catalog resources and documentation
├── data-science/   # Future research, experiments, and evaluation
├── firebase/       # Future Firebase configuration and rules
├── docs/           # Future architecture and development documentation
├── .gitignore
└── README.md
```

Directories are intentionally empty in Phase 0. Git does not track empty directories; this phase does not add placeholder files.

## Development phases

1. **Phase 0 — Project foundation:** create the repository layout, root documentation, ignore rules, and a local Git repository on `main`.
2. **Application foundation:** establish frontend, backend, Firebase integration, and development tooling.
3. **Retail experience:** develop catalog browsing and a responsive premium footwear discovery experience.
4. **Visual AI discovery:** implement the FastAPI service, embeddings, cosine similarity retrieval, and meaningful evaluation.
5. **Future intelligence:** incrementally investigate multimodal search, recommendations, segmentation, analytics, forecasting, explainability, and an AI shopping agent.

Later phases are provisional and require separate implementation work.

## Data Science Evaluation

The repository includes a reproducible, evidence-limited evaluation layer in `data-science/`. A small manually labeled query set derived from the real four-product catalog measures OpenCLIP text retrieval with Precision@K, Recall@K, MRR, and NDCG@K. The evaluation executes real model embeddings and catalog ranking; expected rankings are not hardcoded.

Personalized recommendations do not have genuine historical relevance or feedback labels, so recommendation accuracy metrics are intentionally not reported. Instead, deterministic sanity checks cover product exclusion, valid IDs, repeatability, grounded reason codes, and honest cold-start behavior. Persisted product-image embeddings are analyzed with cosine similarity and deterministic PCA. Clustering is omitted because four samples cannot support meaningful cluster interpretation.

The relevance set is small, manually labeled, and drawn from the same demo catalog. Results are demonstration metrics, not production benchmarks or evidence of broad generalization. Live Firestore analytics remain aggregate-only and exclude UIDs, emails, names, tokens, and raw private records. See `data-science/README.md` for commands, metric definitions, generated reports, privacy rules, and limitations.

## AI Shopping Agent

The HEX Assistant is a deterministic, grounded Phase 1 shopping agent over real application tools—not an LLM. Express routes discovery through existing OpenCLIP text retrieval, resolves only canonical products, compares real catalog fields, retrieves CLIP Similar Styles, and uses existing recommendation, profile, wishlist, and cart services. Responses are structured for product links, comparisons, summaries, and grounded explanations.

Authenticated mutations require an explicit second-step confirmation. The server issues short-lived HMAC-signed, UID-bound, single-use action tokens and executes only the signed action after confirmation. Context is bounded to canonical current/referenced product IDs and is not stored in Firestore. Inventory, delivery, live size availability, checkout, and return-policy data are not modeled and are never invented.

## Current status

The repository now contains the React storefront, Express API, Firebase-backed account data, FastAPI/OpenCLIP retrieval service, multimodal discovery, content-based recommendations, and the evidence-limited evaluation layer described above. Commerce, sales analytics, forecasting, customer segmentation, and production-scale model evaluation are not implemented.

Keep credentials, environment files, Firebase service accounts, and private keys out of version control. Future `.env.example` files should contain placeholders only. Ignore rules reduce accidental tracking but do not replace credential checks.
