# HEXSHOES Backend

Backend Phase 1 provides a typed, testable HTTP API foundation for HEXSHOES. It intentionally uses local presentation fixtures and does not connect to Firebase, authentication, payments, or the Python AI service.

## Stack and structure

Node.js 20+, Express 5, strict TypeScript, Helmet, origin-restricted CORS, Vitest, Supertest, and Oxlint. Requests follow `route -> controller -> service -> data`; configuration, middleware, domain types, and utilities live in dedicated folders. This keeps the fixture boundary replaceable by a repository.

## Setup

```bash
npm install
copy .env.example .env
npm run dev
```

The `.env` copy is optional because safe local defaults are provided. Never track credentials or private keys.

## Scripts

- `npm run dev` — watch-mode TypeScript server
- `npm run build` / `npm run start` — compile to `dist/` and run compiled code
- `npm run typecheck` — strict type validation without emit
- `npm run lint` — lightweight static analysis
- `npm run test` / `npm run test:watch` — API tests once or in watch mode

## Endpoints

- `GET /api/health`
- `GET /api/status`
- `GET /api/products` (optional `category`, `audience`, and `new=true|false` filters)
- `GET /api/products/:id`

Success responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "error": { "message": "..." } }`.

## Current limitations and future work

Products are temporary backend-local presentation fixtures, not inventory, availability, sales, demand, review, or recommendation data. Replace `src/data/products.ts` with a Firestore repository/service in a later phase.

Firebase Admin, Firestore, Firebase Auth, real authentication, FastAPI, PyTorch/OpenCLIP, recommendations, analytics, commerce workflows, and payments are not connected or implemented.
