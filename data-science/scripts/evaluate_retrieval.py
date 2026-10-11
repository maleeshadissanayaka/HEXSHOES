from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "data-science"))
sys.path.insert(0, str(ROOT / "ai-service"))

from evaluation.metrics import ndcg_at_k, precision_at_k, recall_at_k, reciprocal_rank
from app.config import settings
from app.models.clip_model import ClipModelService
from app.services.catalog_index_service import CatalogIndexService
from app.services.embedding_service import EmbeddingService


def evaluate(dataset_path: Path, k: int) -> dict[str, object]:
    queries = json.loads(dataset_path.read_text(encoding="utf-8"))
    index = CatalogIndexService(settings.catalog_index_directory, settings.model_name, settings.pretrained)
    index.load()
    clip = ClipModelService(settings.model_name, settings.pretrained)
    clip.initialize()
    embeddings = EmbeddingService(clip).embed_text([item["query"] for item in queries])
    per_query: list[dict[str, object]] = []
    for label, embedding in zip(queries, embeddings, strict=True):
        ranked = index.search(embedding, len(index.product_ids))
        ranking = [item.product_id for item in ranked]
        relevant = set(label["relevantProductIds"])
        per_query.append({
            "query": label["query"], "relevantProductIds": sorted(relevant),
            "ranking": [{"rank": item.rank, "productId": item.product_id, "similarityScore": item.similarity_score} for item in ranked],
            "precisionAt1": precision_at_k(ranking, relevant, 1),
            f"precisionAt{k}": precision_at_k(ranking, relevant, k),
            f"recallAt{k}": recall_at_k(ranking, relevant, k),
            "reciprocalRank": reciprocal_rank(ranking, relevant),
            f"ndcgAt{k}": ndcg_at_k(ranking, relevant, k),
        })
    metric_names = ["precisionAt1", f"precisionAt{k}", f"recallAt{k}", "reciprocalRank", f"ndcgAt{k}"]
    summary = {name: float(np.mean([float(item[name]) for item in per_query])) for name in metric_names}
    return {"label": "Demonstration metrics on a small manually labeled four-product catalog", "queryCount": len(queries), "k": k, "summary": summary, "queries": per_query}


def main() -> None:
    parser = argparse.ArgumentParser(description="Evaluate real OpenCLIP text-to-product retrieval.")
    parser.add_argument("--dataset", type=Path, default=ROOT / "data-science/data/retrieval_queries.json")
    parser.add_argument("--output", type=Path, default=ROOT / "data-science/reports/retrieval_evaluation.json")
    parser.add_argument("--k", type=int, default=3)
    args = parser.parse_args()
    report = evaluate(args.dataset, args.k)
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(report, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(report, indent=2))


if __name__ == "__main__":
    main()
