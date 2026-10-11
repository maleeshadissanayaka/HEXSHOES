# HEXSHOES Backend

The HEXSHOES backend provides a typed, testable HTTP API with a repository boundary for the Firestore `products` collection, server-side Firebase ID-token verification, and an internal bridge to the Python AI service for visual retrieval. Payments are not connected.

## Stack and structure

Node.js 20+, Express 5, strict TypeScript, Firebase Admin, Helmet, origin-restricted CORS, Vitest, Supertest, and Oxlint. Requests follow `route -> controller -> service -> repository -> data source`; configuration, middleware, domain types, and utilities live in dedicated folders.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

The `.env` copy is optional because safe local defaults are provided. Never track credentials or private keys.

## Product data source

`PRODUCT_DATA_SOURCE=fixture` is the default and is used for local development and tests without credentials. It reads the four presentation products from `src/data/products.ts`.

To use Firestore explicitly, set:

```dotenv
PRODUCT_DATA_SOURCE=firestore
FIREBASE_PROJECT_ID=your-project-id
FIREBASE_CLIENT_EMAIL=server-service-account@example.iam.gserviceaccount.com
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

These variables are server-side only. Escaped newlines in the private key are normalized during initialization. Firestore mode fails startup when configuration is missing; it never silently falls back to fixtures.

## Scripts

- `npm run dev` — watch-mode TypeScript server
- `npm run build` / `npm run start` — compile to `dist/` and run compiled code
- `npm run typecheck` — strict type validation without emit
- `npm run lint` — lightweight static analysis
- `npm run test` / `npm run test:watch` — API tests once or in watch mode
- `npm run seed:products` — write/update the four canonical product documents

## Endpoints

- `GET /api/health`
- `GET /api/status`
- `GET /api/products` (optional `category`, `audience`, and `new=true|false` filters)
- `GET /api/products/:id`
- `GET /api/me` (requires a valid Firebase ID token)
- `GET /api/profile` and `PATCH /api/profile` (authenticated profile read/update)
- `GET /api/wishlist`, `POST /api/wishlist/:productId`, and `DELETE /api/wishlist/:productId`
- `GET /api/cart`, `POST /api/cart/:productId`, `PATCH /api/cart/:productId`, `DELETE /api/cart/:productId`, and `DELETE /api/cart` (authenticated)
- `POST /api/visual-search` (multipart image and optional `topK`)
- `POST /api/visual-search/text` (`query` and optional `topK`)
- `POST /api/visual-search/multimodal` (optional image, optional text, at least one required)
- `GET /api/products/:id/similar` (public content similarity)
- `GET /api/recommendations` (authenticated wishlist/cart recommendations or honest cold start)
- `POST /api/agent/message` (public grounded orchestration with optional authentication)
- `POST /api/agent/confirm` (authenticated execution of a signed pending action)

Success responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "message": "..." } }`.

## Firebase Authentication

`GET /api/me` is protected by Firebase Admin ID-token verification. Send the current Firebase browser ID token using:

```http
Authorization: Bearer <firebase-id-token>
```

Missing or malformed authorization returns `401 Authentication required`. Invalid, expired, or revoked tokens return `401 Invalid or expired authentication`. The endpoint returns only the safe user projection available from verified claims: `uid` and optional `email`, `emailVerified`, `name`, `picture`, and sign-in `provider`. It never returns the raw token, private claims, service-account data, or Firebase internals.

`/api/health`, `/api/status`, `/api/products`, and `/api/products/:id` remain public. An authenticated `/api/me` or profile request creates `users/{uid}` from verified claims when it does not exist. `PATCH /api/profile` permits only `displayName`; identity and timestamp fields cannot be client-written.

Authenticated saved styles use `users/{uid}/wishlist/{productId}` with canonical server timestamps and product IDs only. Wishlist product IDs are validated against the product repository, duplicate adds are idempotent, and list responses resolve current product objects. Every profile and wishlist operation derives `uid` exclusively from the verified token; no route accepts a client-selected user ID.

Authenticated carts use `users/{uid}/cart/{productId}`. Each document stores `productId`, integer `quantity`, canonical server-managed `addedAt` and `updatedAt` timestamps, and the selected presentation `size` when supplied. Products are validated against the product repository. Quantities must be integers from 1 through 10; duplicate adds increment atomically and cap at 10. Cart responses resolve the current canonical product, so price and product data are never accepted from or persisted from the client. Every cart operation derives ownership exclusively from the verified token UID.

Firebase Admin bypasses Firestore client security rules. Server security therefore depends on ID-token verification, server-owned UID selection, strict input validation, and the repository/service boundary. Firestore rules are not weakened for this integration.

## OpenCLIP visual-search integration

The browser sends visual-search requests only to Express. Express forwards validated queries to the internal FastAPI service configured by `AI_SERVICE_BASE_URL` (default `http://127.0.0.1:8000`) with `AI_SERVICE_TIMEOUT_MS` defaulting to 120 seconds for CPU inference. Image uploads remain in memory, are limited by `VISUAL_SEARCH_MAX_IMAGE_BYTES` (5 MiB by default), and accept only JPEG, PNG, or WebP. Uploaded bytes are neither persisted nor logged.

FastAPI returns only ranked product IDs and cosine similarity scores. Express validates ranks, finite scores, uniqueness, and requested result count, then resolves every known ID through the canonical product repository. Unknown IDs are skipped rather than fabricated. Offline, timed-out, unavailable-index, and malformed-response cases return the controlled `503 Visual search service is temporarily unavailable` contract without Python errors, internal URLs, or tracebacks. `/api/status` reports only that the integration is configured; it does not claim a live health check.

Recommendation ownership follows the same boundary. Express derives the UID only from the verified Firebase token, reads that user's wishlist and cart, and sends product IDs/signals to FastAPI. Wishlist weight is manually configured at `1.0`; cart weight ranges from `1.0` to `1.45` with capped quantity influence. Interacted products are excluded. With no interactions, Express does not call AI or claim personalization: it returns new-first canonical catalog discovery. Explanations are deterministic reason-code mappings grounded in the current product, wishlist, cart, or cold-start strategy.

## Firestore collection and seeding

The collection is `products`, using deterministic document IDs `hx-01` through `hx-04`. Fields match the `Product` TypeScript interface. Firestore documents are explicitly validated before being returned; malformed data produces a controlled server error rather than an unsafe cast.

`npm run seed:products` requires valid Firebase Admin environment configuration. It merges only the four canonical fixture records and does not delete unrelated documents. It is never run automatically.

Do not commit `.env`, service-account JSON, private keys, or credentials. Never copy Firebase Admin configuration into frontend code.

## Grounded shopping agent

Phase 1 is a deterministic tool-using agent, not an LLM. Intent parsing, tool adapters, orchestration, response contracts, and confirmation security are separated under `src/agent/`. Public requests can use existing OpenCLIP text search, compare canonical products, find Similar Styles, receive honest catalog discovery, and request help. Optional Firebase authentication enables profile, wishlist, cart, and personalized-recommendation tools.

Wishlist and cart mutations are never executed from the initial message. `/api/agent/message` returns a short-lived HMAC-signed pending action. `/api/agent/confirm` verifies the Firebase user, signature, expiry, UID binding, action fields, and single-use identifier before calling the existing wishlist or cart service. `AGENT_ACTION_SECRET` may hold a high-entropy server-only secret; when absent, local development uses a random process-lifetime secret. Tokens and message contents are not logged.

Browser context is limited to a current product and at most four referenced product IDs, all resolved through the canonical repository. Messages are limited to 500 characters, results to four products, and quantities to 1–10. Inventory, delivery, live size availability, checkout, and return-policy answers are unsupported and never fabricated.

## Current limitations and future work

The local products remain presentation fixtures and also serve as the deterministic Firestore seed source. They are not inventory, availability, sales, demand, review, or recommendation data.

Firebase Admin supports Firestore access, Firebase ID-token verification, user profiles, saved styles, authenticated carts, and ephemeral content-based personalization, but a live project requires server credentials. Collaborative filtering, behavioral event tracking, analytics, checkout, inventory, commerce workflows, and payments are not implemented.
