# Validation report

Date: 2026-10-12. Scope: local portfolio/demo readiness; no deployment or production benchmark.

## Reviewed controls

- Exact-origin CORS; Helmet; bounded bodies, images, topK, messages, context, and cart quantities.
- Server-side Firebase verification and UID-derived ownership.
- Generic internal errors and a logging policy excluding tokens, emails, profile fields, image bytes, and secrets.
- Expiring, UID-bound, signed confirmation for agent mutations; production secret fails closed.
- No random AI fallback; corrupt/mismatched index stays unavailable; catalog image paths cannot escape the repository.
- Loading, empty, and controlled error states across major UI flows; semantic controls, labels, alt text, focus restoration, Escape close, visible focus, and reduced motion sanity-reviewed. This is not WCAG certification.

## Automated and live evidence

- Backend: lint, typecheck, build passed; 96/96 tests passed.
- Frontend: lint, typecheck, build passed; 25/25 tests passed. Production output: 474.28 kB JS (141.47 kB gzip), 118.42 kB CSS (23.02 kB gzip), 1.09 kB HTML.
- AI: 26/26 default tests and 2/2 real-model integration tests passed.
- Data science: 9/9 tests passed; retrieval and recommendation/embedding scripts completed. Eight-query demonstration metrics remained P@1 1.0, P@3 0.333333, R@3 1.0, MRR 1.0, NDCG@3 1.0.
- Browser: 124 automated Chromium checks; zero console errors, zero unexpected failed responses, and no mutation requests. The sole failed response was the intentional missing-product 404. This run covers routes, responsive layouts, keyboard/modal behaviors and signed-out flows; live provider popups and authenticated destructive flows were not repeated.
- Live services: root health passed; AI status reported CPU, ready OpenCLIP model, four-product 512D compatible index.
- Warm local CPU observations (three sequential requests, not benchmarks): text search 539.1/87.2/74.4 ms; image search 1364.7/326.7/263.2 ms. The first request in each series includes warm-up effects.

## Limitations

Four concept products, one image each, small same-catalog relevance labels, no checkout/inventory/orders, distributed limiter or production monitoring, no Safari/Firefox/formal assistive-technology audit, and no deployed-host cold-start data.
