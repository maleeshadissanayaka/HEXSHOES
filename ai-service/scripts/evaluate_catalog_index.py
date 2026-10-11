import json

from PIL import Image

from app.config import settings
from app.models.clip_model import ClipModelService
from app.services.catalog_index_service import CatalogIndexService, load_manifest
from app.services.embedding_service import EmbeddingService

TEXT_QUERIES = ["running shoe", "trail shoe", "slide sandal", "minimal lifestyle sneaker"]


def main() -> None:
    clip = ClipModelService(settings.model_name, settings.pretrained)
    clip.initialize()
    embeddings = EmbeddingService(clip)
    index = CatalogIndexService(settings.catalog_index_directory, settings.model_name, settings.pretrained)
    index.load()
    self_results = []
    for item in load_manifest(settings.catalog_manifest):
        with Image.open(item.image_path) as image:
            ranking = index.search(embeddings.embed_image(image.convert("RGB"))[0], len(index.product_ids))
        self_results.append({
            "queryProductId": item.product_id,
            "results": [
                {"rank": result.rank, "productId": result.product_id, "similarityScore": result.similarity_score}
                for result in ranking
            ],
        })
    text_results = []
    for query in TEXT_QUERIES:
        ranking = index.search(embeddings.embed_text(query)[0], len(index.product_ids))
        text_results.append({
            "query": query,
            "results": [
                {"rank": result.rank, "productId": result.product_id, "similarityScore": result.similarity_score}
                for result in ranking
            ],
        })
    top_one = sum(result["results"][0]["productId"] == result["queryProductId"] for result in self_results)
    payload = {
        "evaluation": "exact-image self-retrieval sanity check (not held-out accuracy)",
        "productCount": len(self_results),
        "selfRetrievalTop1": {"correct": top_one, "total": len(self_results)},
        "selfRetrievalTopK": {"correct": len(self_results), "total": len(self_results), "k": len(index.product_ids)},
        "imageQueries": self_results,
        "textQueries": text_results,
    }
    print(json.dumps(payload, indent=2))


if __name__ == "__main__":
    main()
