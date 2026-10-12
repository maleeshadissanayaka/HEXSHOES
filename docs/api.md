# API reference

Production base URL: `https://hexshoes-api.vercel.app/api`

Successful Express responses use `{ "success": true, "data": ... }`. Errors use `{ "success": false, "error": { "message": "..." } }`. Protected routes require `Authorization: Bearer <Firebase ID token>`.

## Express API

| Method | Route | Authentication | Purpose |
| --- | --- | --- | --- |
| GET | `/health` | No | Process liveness and environment |
| GET | `/status` | No | Configuration status without dependency probing |
| GET | `/products` | No | Catalog list; supports `category`, `audience`, and `new` filters |
| GET | `/products/:id` | No | Canonical product detail |
| GET | `/products/:id/similar` | No | CLIP image-similarity recommendations |
| GET | `/me` | Yes | Safe projection of verified Firebase identity |
| GET/PATCH | `/profile` | Yes | Read profile or update `displayName` |
| GET | `/wishlist` | Yes | Persisted saved products |
| POST/DELETE | `/wishlist/:productId` | Yes | Add or remove a canonical product |
| GET | `/cart` | Yes | Persisted cart with canonical product data |
| POST/PATCH/DELETE | `/cart/:productId` | Yes | Add, update, or remove a cart line |
| DELETE | `/cart` | Yes | Clear the authenticated cart |
| POST | `/visual-search` | No | Multipart image search with optional `topK` |
| POST | `/visual-search/text` | No | JSON text search with `query` and optional `topK` |
| POST | `/visual-search/multimodal` | No | Multipart image and/or text search |
| GET | `/recommendations` | Yes | Wishlist/cart recommendations or honest cold start |
| POST | `/agent/message` | Optional | Deterministic response and optional pending action |
| POST | `/agent/confirm` | Yes | Execute a valid signed pending action |

Ownership always comes from the verified token UID. No protected route accepts a client-selected user ID. Cart quantity is an integer from 1 through 10. Discovery `topK` is from 1 through 4. Image search accepts JPEG, PNG, or WebP up to 5 MiB; uploaded bytes are not persisted.

Agent context contains only a current product ID, up to four referenced product IDs, and the last intent. An initial message never executes a mutation. Confirmation requires the opaque pending token returned by the message route.

## Internal FastAPI API

The production service is at `https://hexshoes-production.up.railway.app`, but normal browser flows access it through Express.

| Method | Route | Purpose |
| --- | --- | --- |
| GET | `/` | Service identification |
| GET | `/health` | Process liveness |
| GET | `/status` | Model and index readiness |
| POST | `/embed/text` | Text embedding metadata |
| POST | `/embed/image` | Image embedding metadata |
| POST | `/similarity/text` | Candidate text cosine similarity |
| POST | `/search/text` | Text-to-catalog retrieval |
| POST | `/search/image` | Image-to-catalog retrieval |
| POST | `/search/multimodal` | Fused image/text retrieval |
| GET | `/recommend/similar/{product_id}` | Similar catalog products |
| POST | `/recommend/user` | Content-based user recommendations |

FastAPI returns cosine similarity scores, not probabilities or confidence. `/status` returns 503 until both model and compatible index are ready.

Common statuses are 400 malformed input, 401 authentication failure, 404 missing route or product, 413 oversized upload, 422 semantic constraint failure, 500 generic internal failure, and 503 unavailable AI/index dependency. Public errors do not expose stacks, credentials, provider diagnostics, or internal URLs.
