from __future__ import annotations

import csv
import json
import sys
from pathlib import Path

import numpy as np

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "data-science"))
from evaluation.analysis import cosine_similarity_matrix, pca_projection


def main() -> None:
    directory = ROOT / "ai-service/data/embeddings"
    reports = ROOT / "data-science/reports"
    reports.mkdir(parents=True, exist_ok=True)
    ids = json.loads((directory / "product_ids.json").read_text(encoding="utf-8"))
    embeddings = np.load(directory / "product_embeddings.npy", allow_pickle=False)
    similarities = cosine_similarity_matrix(embeddings)
    coordinates, variance = pca_projection(embeddings)

    with (reports / "product_similarity.csv").open("w", newline="", encoding="utf-8") as output:
        writer = csv.writer(output)
        writer.writerow(["productId", *ids])
        for product_id, row in zip(ids, similarities, strict=True):
            writer.writerow([product_id, *(f"{value:.9f}" for value in row)])
    with (reports / "product_similarity_pairs.csv").open("w", newline="", encoding="utf-8") as output:
        writer = csv.writer(output)
        writer.writerow(["productIdA", "productIdB", "cosineSimilarity"])
        for left in range(len(ids)):
            for right in range(left + 1, len(ids)):
                writer.writerow([ids[left], ids[right], f"{similarities[left, right]:.9f}"])
    with (reports / "product_pca.csv").open("w", newline="", encoding="utf-8") as output:
        writer = csv.writer(output)
        writer.writerow(["productId", "pc1", "pc2"])
        for product_id, point in zip(ids, coordinates, strict=True):
            writer.writerow([product_id, f"{point[0]:.9f}", f"{point[1]:.9f}"])
    analysis = {"label": "Exploratory 2D projection of 512D CLIP embeddings.", "productCount": len(ids), "explainedVarianceRatio": variance.tolist(), "explainedVarianceTotal": float(variance.sum()), "clustering": "Skipped: four products are insufficient for a credible clustering interpretation."}
    (reports / "embedding_analysis.json").write_text(json.dumps(analysis, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(analysis, indent=2))


if __name__ == "__main__":
    main()
