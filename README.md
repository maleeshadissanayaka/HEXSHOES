# HEXSHOES

AI-Powered Retail Intelligence & Footwear Discovery Platform

HEXSHOES is a planned footwear discovery and retail intelligence platform with two goals: demonstrate practical Data Science and Software Engineering skills, and establish a foundation for a future footwear e-commerce business.

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

## Current status: Phase 0

Only the project foundation has been created. There is no application code, installed dependency set, Firebase setup, AI model, or running service. The local Git repository uses `main`; no remote or commit has been created during this phase.

Keep credentials, environment files, Firebase service accounts, and private keys out of version control. Future `.env.example` files should contain placeholders only. Ignore rules reduce accidental tracking but do not replace credential checks.
