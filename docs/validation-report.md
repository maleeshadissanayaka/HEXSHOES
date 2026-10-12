# Validation report

Date: 2026-10-13. Scope: final deployed portfolio validation, not an SLA, certification, load test, or production ML benchmark.

## Automated validation

| Area | Result |
| --- | --- |
| Frontend | Lint, typecheck, build, and 25 tests passed |
| Backend | Lint, typecheck, build, and 103 tests passed across 8 files |
| AI service | 26 safe tests passed; 2 real-model integration tests intentionally deselected by the default suite |
| AI runtime | Python 3.12.10; PyTorch 2.10.0+cpu; `torch.version.cuda is None`; CUDA unavailable |

## Production validation

- Frontend is live on Vercel.
- Express backend is live on Vercel.
- Firebase Authentication and Cloud Firestore are connected.
- FastAPI is live on Railway and ready on CPU.
- OpenCLIP model: `ViT-B-32` with `laion2b_s34b_b79k` weights.
- Catalog index: four products, normalized 512-dimensional embeddings.
- Text search, image search, and multimodal search passed.
- Similar Styles and personalized wishlist/cart recommendations passed.
- Deterministic shopping-agent routing and confirmation workflow passed.
- Frontend/backend/AI integration passed end to end.

## Evaluation evidence

The committed eight-query retrieval report contains P@1 1.0, P@3 0.333333, Recall@3 1.0, MRR 1.0, and NDCG@3 1.0.

This is a manually labeled same-catalog evaluation over the four-product demonstration catalog, not a production benchmark or evidence of broad retrieval quality.

## Reviewed controls

- Exact-origin production CORS, Helmet, bounded bodies, uploads, and agent context.
- Server-side Firebase ID-token verification and UID-derived ownership.
- Generic public internal errors and logging that excludes credentials, tokens, emails, private profile fields, and image bytes.
- Signed, expiring, UID-bound, single-use confirmation for agent mutations.
- Canonical product resolution; unknown AI product IDs are not fabricated.
- Index/model compatibility validation and repository-bound catalog image paths.
- Honest cold start and deterministic recommendation reasons.

## Limitations

- Four products and one indexed image per product.
- Same-catalog labels and a small query set.
- CPU inference and possible free/serverless cold starts.
- Two heavyweight real-model tests are outside the default safe suite.
- No checkout, payments, inventory, orders, shipping, returns, collaborative filtering, distributed rate limiting, or production monitoring.
- No claim of formal penetration testing, WCAG certification, SLA compliance, or production-scale performance.
