# API reference

Express uses base path `/api`. Success is `{ "success": true, "data": ... }`; errors are `{ "success": false, "error": { "message": "..." } }`. Authenticated routes require a Firebase bearer ID token.

| Area | Endpoints | Auth |
| --- | --- | --- |
| Liveness/status | `GET /health`, `GET /status` | No |
| Catalog | `GET /products`, `GET /products/:id`, `GET /products/:id/similar` | No |
| Account | `GET /me`, `GET/PATCH /profile` | Yes |
| Wishlist | `GET /wishlist`, `POST/DELETE /wishlist/:productId` | Yes |
| Cart | `GET /cart`, `POST/PATCH/DELETE /cart/:productId`, `DELETE /cart` | Yes |
| Discovery | `POST /visual-search`, `/visual-search/text`, `/visual-search/multimodal` | No |
| Recommendations | `GET /recommendations` | Yes |
| Agent | `POST /agent/message`, `POST /agent/confirm` | Optional / Yes |

Ownership always comes from the verified token UID. Cart quantity is 1–10. Discovery `topK` is 1–4. JPEG, PNG, and WebP uploads are decoded in memory, limited to 5 MiB, and not persisted. Agent messages carry only bounded structured context; the initial message never executes a wishlist/cart mutation.

FastAPI is internal to Express: `/health`, `/status`, `/embed/text`, `/embed/image`, `/similarity/text`, `/search/text`, `/search/image`, `/search/multimodal`, `/recommend/similar/{id}`, and `/recommend/user`. `/health` is process liveness; `/status` returns 503 until model and compatible catalog index are ready.

Common statuses: 400 malformed input, 401 authentication failure, 404 route/product absent, 413 oversized AI upload, 422 validated semantic constraints, 500 generic internal failure, and 503 unavailable AI/index. Public responses contain no stack or provider diagnostics.
