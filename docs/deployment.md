# Production deployment

## Live architecture

| Layer | Host | URL |
| --- | --- | --- |
| Frontend | Vercel | `https://hexshoes.vercel.app` |
| Backend API | Vercel | `https://hexshoes-api.vercel.app/api` |
| AI service | Railway | `https://hexshoes-production.up.railway.app` |
| Authentication and data | Firebase | Firebase Authentication and Cloud Firestore |

The browser calls Express only. Express verifies Firebase ID tokens, owns Firestore access and mutations, and calls FastAPI for retrieval and recommendation ranking. FastAPI returns ranked product IDs and similarity data; Express resolves IDs through the canonical catalog.

## Frontend: Vercel

Deploy `frontend` as a Vite application with `npm run build` and output directory `dist`. Configure `VITE_API_BASE_URL` with the public backend `/api` base and provide only the public `VITE_FIREBASE_*` Web SDK configuration.

Add `hexshoes.vercel.app` to Firebase Authentication authorized domains. Email/password and Google sign-in providers must be enabled. Browser routing requires Vercel to serve the application entry point for client-side routes.

## Backend: Vercel

The backend uses `backend/api/index.ts` as the Vercel serverless adapter and preserves Express `/api` routes through `backend/vercel.json`. The adapter imports the same Express application used locally; it does not create a second API implementation.

Production configuration requires `NODE_ENV`, `FRONTEND_ORIGIN`, `PRODUCT_DATA_SOURCE`, `FIREBASE_PROJECT_ID`, `FIREBASE_CLIENT_EMAIL`, `FIREBASE_PRIVATE_KEY`, `AI_SERVICE_BASE_URL`, `AI_SERVICE_TIMEOUT_MS`, `VISUAL_SEARCH_MAX_IMAGE_BYTES`, and `AGENT_ACTION_SECRET`.

`FRONTEND_ORIGIN` must exactly match the deployed frontend. Production CORS accepts that configured origin; local loopback origins are added only outside production. `AGENT_ACTION_SECRET` must be unique, server-only, and at least 32 characters.

The `jwks-rsa` package receives a `jose` 4.15.9 override in `backend/package.json`. Preserve this compatibility pin unless dependency upgrades are validated against Firebase Admin and the Vercel build/runtime.

## AI service: Railway

Railway runs FastAPI with Python pinned to `3.12.10` by `ai-service/.python-version`. The dependency file selects CPU-only PyTorch and torchvision wheels, avoiding CUDA runtime packages. CPU inference suits this small demonstration catalog and current host, but cold starts and first-request model warm-up can be noticeable.

The production model is OpenCLIP `ViT-B-32` with `laion2b_s34b_b79k` weights. Startup initializes the model and loads the committed four-product, 512-dimensional normalized index. `/health` is process liveness. `/status` returns 200 only when the model and compatible index are ready, otherwise 503.

Railway must bind the process to its externally reachable host and assigned port. The model cache and available memory must be sufficient for PyTorch and OpenCLIP.

## Firebase

Firebase Authentication supports email/password and Google sign-in. Cloud Firestore stores canonical products, profiles, wishlists, and carts. Firebase Admin credentials exist only in backend host configuration; the AI service does not access Firebase.

Before deployment, confirm both providers are enabled, the production frontend is an authorized domain, Firestore contains the four canonical products, backend Admin credentials target the intended project, and client rules have not been weakened to compensate for server behavior.

## Deployment order and checks

1. Deploy the Railway AI service and wait for `/status` to return ready.
2. Deploy the Vercel backend and verify `/api/health` and `/api/status`.
3. Deploy the Vercel frontend.
4. Verify authentication, profile persistence, wishlist, cart, all search modes, Similar Styles, recommendations, and agent confirmation.
5. Inspect sanitized logs and retain the prior deployment for rollback.

Free/serverless instances may cold-start. A liveness response does not prove model readiness; use the AI `/status` endpoint for that distinction.

## Secrets and source control

Real `.env` files, Firebase service-account JSON, private keys, and agent secrets are ignored and must never be committed. Environment examples contain variable names and local placeholders only. Firebase Web SDK values are public identifiers, but Admin credentials and `AGENT_ACTION_SECRET` remain server-side.

No Dockerfile is required by the selected deployment path. Add containerization only when hosting or release requirements justify it and validate CPU wheel resolution within that image.
