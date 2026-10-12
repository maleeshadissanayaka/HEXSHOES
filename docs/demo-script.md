# Live demo script

Target length: five to seven minutes. Start at [hexshoes.vercel.app](https://hexshoes.vercel.app).

1. **Homepage** — introduce the premium responsive experience and four-product demonstration scope.
2. **Authentication and account** — sign in with email/password or Google and show the backend-verified session and persisted profile.
3. **Catalog** — open Shop and a product detail page; explain that products are canonical presentation records, not inventory.
4. **Wishlist and cart** — save and add a product, then show the persisted Firestore-backed state.
5. **Text search** — search for “trail shoe” and show grounded catalog ranking.
6. **Image search** — upload or select a sample and show visual-similarity results.
7. **Multimodal search** — combine an image with text and explain the explicit 60% image / 40% text fusion.
8. **Similar Styles** — show image-similarity recommendations that exclude the source product.
9. **Personalized recommendations** — show wishlist/cart-derived results and deterministic evidence; mention honest catalog discovery when no interaction history exists.
10. **HEX Assistant** — ask for a trail shoe, compare Runner and Trail, and request a wishlist or cart action. Show that the first response does not mutate state, then confirm the signed pending action.
11. **Architecture** — summarize React/Vite and Express on Vercel, FastAPI/OpenCLIP on Railway CPU, and Firebase Authentication/Firestore.
12. **Evaluation boundary** — mention the eight-query results only as a same-catalog labeled demo evaluation, not production accuracy.

Avoid describing cosine similarity as confidence, the assistant as an LLM, or recommendations as collaborative filtering. Do not show tokens, emails, UIDs, credentials, private Firestore records, or environment values.
