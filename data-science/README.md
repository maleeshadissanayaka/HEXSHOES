# HEXSHOES Data Science Evaluation

This directory provides reproducible, evidence-limited evaluation for the real four-product HEXSHOES demo catalog. It does not contain business KPIs, customer exports, recommendation-accuracy claims, forecasts, or customer segmentation.

## Evidence and architecture

- `data/retrieval_queries.json` is a small manually labeled text-retrieval set based only on canonical product category, identity, and description.
- `evaluation/` contains deterministic metric, embedding-analysis, and recommendation-sanity helpers.
- `scripts/evaluate_retrieval.py` loads the persisted catalog index, generates real OpenCLIP text embeddings, ranks with the application retrieval logic, and calculates relevance metrics.
- `scripts/validate_recommendations.py` reuses the application recommendation service and persisted embeddings. Its interactions are explicitly algorithm test scenarios, not user data.
- `scripts/analyze_embeddings.py` reads the persisted normalized image embeddings without reloading the model.
- `scripts/analyze_interactions.mjs` reads the connected Firestore project and prints aggregate counts only. It does not write a report by default.
- `reports/` contains small, public-safe, reproducible catalog reports.

## Commands

Run from the repository root using the existing AI virtual environment:

```powershell
ai-service\.venv\Scripts\python.exe -m pytest data-science/tests
ai-service\.venv\Scripts\python.exe data-science/scripts/evaluate_retrieval.py
ai-service\.venv\Scripts\python.exe data-science/scripts/validate_recommendations.py
ai-service\.venv\Scripts\python.exe data-science/scripts/analyze_embeddings.py
```

Live Firestore aggregation uses the existing ignored `backend/.env` credentials:

```powershell
node data-science/scripts/analyze_interactions.mjs
```

Do not redirect live output into a tracked file without first verifying that the result is aggregate-only and appropriate to publish.

## Metric definitions

- **Precision@K:** relevant results among the first K results, divided by K.
- **Recall@K:** relevant labeled items found among the first K results, divided by all relevant labeled items.
- **MRR:** mean reciprocal rank of the first relevant item.
- **NDCG@K:** discounted ranking quality at K, normalized by the ideal ordering. Labels are binary in this dataset.

These are demonstration retrieval metrics, not production metrics. Personalized recommendation Precision, Recall, MRR, and NDCG are deliberately not calculated because no genuine recommendation-feedback labels exist.

## Recommendation validation

Recommendation checks cover source-product exclusion, interacted-item exclusion, repeatability, reason grounding, valid catalog IDs, and the stable new-first cold-start policy. Wishlist weight is `1.0`. Cart weight is `1.0 + 0.15` per additional quantity, capped at quantity four (`1.45`). Test scenarios validate mechanics only and are not representations of users.

## Privacy

The Firestore analytics script outputs profile-document count, aggregate wishlist/cart counts, and product-level interaction counts. It never emits Firebase UIDs, emails, names, tokens, timestamps, or raw profile documents. No live interaction report is committed because current account activity is private and can change.

## Limitations

The relevance set is manually labeled from the same four-product demo catalog. It is not a holdout set, production benchmark, or evidence of broad generalization. There is one image embedding per product and no user-feedback relevance dataset. PCA is an exploratory 2D projection of four 512D CLIP embeddings; it does not demonstrate meaningful clusters. Clustering is skipped because four samples cannot support a credible or stable interpretation.
