# HEXSHOES Backend

The HEXSHOES backend provides a typed, testable HTTP API with a repository boundary for local fixture data or the Firestore `products` collection. Firebase Auth, payments, and the Python AI service are not connected.

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

Success responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "message": "..." } }`.

## Firestore collection and seeding

The collection is `products`, using deterministic document IDs `hx-01` through `hx-04`. Fields match the `Product` TypeScript interface. Firestore documents are explicitly validated before being returned; malformed data produces a controlled server error rather than an unsafe cast.

`npm run seed:products` requires valid Firebase Admin environment configuration. It merges only the four canonical fixture records and does not delete unrelated documents. It is never run automatically.

Do not commit `.env`, service-account JSON, private keys, or credentials. Never copy Firebase Admin configuration into frontend code.

## Current limitations and future work

The local products remain presentation fixtures and also serve as the deterministic Firestore seed source. They are not inventory, availability, sales, demand, review, or recommendation data.

Firebase Admin/Firestore repository support is implemented, but a live project requires separate server credentials. Firebase Auth and real authentication remain unconnected. FastAPI, PyTorch/OpenCLIP, recommendations, analytics, commerce workflows, and payments are not implemented.
