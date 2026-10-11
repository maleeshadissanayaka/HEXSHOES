from app.config import settings
from app.models.clip_model import ClipModelService
from app.services.catalog_index_service import CatalogIndexService
from app.services.embedding_service import EmbeddingService


def main() -> None:
    clip = ClipModelService(settings.model_name, settings.pretrained)
    clip.initialize()
    index = CatalogIndexService(settings.catalog_index_directory, settings.model_name, settings.pretrained)
    metadata = index.build(settings.catalog_manifest, EmbeddingService(clip))
    print(
        f"Built catalog index: {metadata.product_count} products, "
        f"{metadata.embedding_dimension} dimensions, model={metadata.model}, "
        f"pretrained={metadata.pretrained}, device={clip.device}"
    )


if __name__ == "__main__":
    main()
