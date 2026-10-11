# Deployment plan (not deployed)

Deploy a static Vite frontend, Node/Express web service, and Python/FastAPI service; retain managed Firebase Auth/Firestore. Hosting quotas, sleep policies, and prices change, so verify official terms when deploying.

- Frontend: Vercel or Netlify (`frontend`; `npm run build`; output `dist`).
- Backend: Render, Railway, Fly.io, or similar (`backend`; `npm ci && npm run build`; `npm start`).
- AI: memory-sufficient CPU service or Hugging Face Space (`pip install -r requirements.txt`; `uvicorn app.main:app --host 0.0.0.0 --port $PORT`). Sleeping/free CPU instances may cold-start slowly or lack enough memory for PyTorch/OpenCLIP.

Official references: [Vercel Vite](https://vercel.com/docs/frameworks/frontend/vite), [Netlify Vite](https://docs.netlify.com/frameworks/vite/), [Render free services](https://render.com/docs/free), [Railway pricing](https://docs.railway.com/reference/pricing/plans), and [Hugging Face Spaces](https://huggingface.co/docs/hub/spaces-overview).

## Environment and order

Frontend needs `VITE_API_BASE_URL` and public `VITE_FIREBASE_*` web configuration. Backend needs `NODE_ENV=production`, provider `PORT`, exact `FRONTEND_ORIGIN`, product data source, Firebase Admin credentials, private `AI_SERVICE_BASE_URL`, timeout/upload limits, and a unique `AGENT_ACTION_SECRET` of at least 32 characters. AI needs host/port, model/pretrained identifiers, image limit, manifest, and index directory. Never expose Admin or agent secrets via `VITE_*`.

Deploy AI first and wait for `/status` 200; deploy Express next and test dependency-backed flows; deploy the frontend last. Configure Firebase authorized domains/rules, run the demo smoke flow, inspect sanitized logs, and retain an immutable prior deployment for rollback.

The first OpenCLIP start may download weights; pin/cache according to host policy. No SLA, autoscaling, distributed rate limiter, monitoring integration, or host benchmark exists yet.

## Docker decision

Dockerfiles are intentionally skipped. Candidate platforms support native builds, while a PyTorch/OpenCLIP image is large and does not solve free-tier memory or model-cache constraints. Add pinned multi-stage images when a selected host or release workflow actually requires them.
