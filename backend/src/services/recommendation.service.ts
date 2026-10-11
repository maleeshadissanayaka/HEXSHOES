import { aiServiceClient, type AiServiceClient, type RecommendationReasonCode } from "./ai.service.js";
import { cartRepository, productRepository, wishlistRepository } from "../repositories/index.js";
import type { CartRepository } from "../repositories/cart.repository.js";
import type { ProductRepository } from "../repositories/product.repository.js";
import type { WishlistRepository } from "../repositories/wishlist.repository.js";

export const RECOMMENDATION_WEIGHTS = Object.freeze({ wishlist: 1, cartBase: 1, cartQuantityStep: 0.15, cartQuantityCap: 4 });
const reasonCopy: Record<RecommendationReasonCode | "COLD_START_DISCOVERY", (name?: string) => string> = {
  SIMILAR_TO_CURRENT_PRODUCT: () => "Visually similar to this style",
  SIMILAR_TO_WISHLIST: (name) => `Similar to ${name ?? "a style"} in your wishlist`,
  SIMILAR_TO_CART: (name) => `Related to ${name ?? "an item"} in your cart`,
  COLD_START_DISCOVERY: () => "Catalog discovery",
};

export class RecommendationService {
  constructor(private readonly ai: AiServiceClient, private readonly products: ProductRepository, private readonly wishlist: WishlistRepository, private readonly cart: CartRepository) {}

  async similar(productId: string, topK = 3) {
    const source = await this.products.findById(productId);
    if (!source) throw new Error("PRODUCT_NOT_FOUND");
    const results = await this.ai.similarProducts(source.id, topK);
    const resolved = await Promise.all(results.map(async (item) => ({ item, product: await this.products.findById(item.productId) })));
    return resolved.filter(({ product }) => product && product.id !== source.id).map(({ item, product }) => ({ rank: item.rank, score: item.score, reasonCode: item.reasonCode, reason: reasonCopy.SIMILAR_TO_CURRENT_PRODUCT(), product: product! }));
  }

  async personalized(uid: string) {
    const [wishlist, cart, catalog] = await Promise.all([this.wishlist.findAll(uid), this.cart.findAll(uid), this.products.findAll()]);
    const interactions = [
      ...wishlist.map(({ productId }) => ({ productId, signal: "wishlist" as const, weight: RECOMMENDATION_WEIGHTS.wishlist })),
      ...cart.map(({ productId, quantity }) => ({ productId, signal: "cart" as const, weight: RECOMMENDATION_WEIGHTS.cartBase + RECOMMENDATION_WEIGHTS.cartQuantityStep * Math.min(Math.max(quantity - 1, 0), RECOMMENDATION_WEIGHTS.cartQuantityCap - 1) })),
    ];
    if (interactions.length === 0) return this.coldStart(catalog);
    const excluded = new Set(interactions.map(({ productId }) => productId));
    const available = catalog.filter(({ id }) => !excluded.has(id)).length;
    if (available === 0) return { personalized: true, strategy: "hybrid-content", results: [] };
    const aiResults = await this.ai.userRecommendations(interactions, Math.min(3, available));
    const resolved = await Promise.all(aiResults.filter(({ productId }) => !excluded.has(productId)).map(async (item) => ({ item, product: await this.products.findById(item.productId), evidence: item.reasonProductId ? await this.products.findById(item.reasonProductId) : undefined })));
    return { personalized: true, strategy: "hybrid-content", results: resolved.filter(({ product }) => product).map(({ item, product, evidence }) => ({ rank: item.rank, score: item.score, reasonCode: item.reasonCode, reason: reasonCopy[item.reasonCode](evidence?.name), product: product! })) };
  }

  private coldStart(catalog: Awaited<ReturnType<ProductRepository["findAll"]>>) {
    const products = [...catalog].sort((left, right) => Number(right.isNew) - Number(left.isNew));
    return { personalized: false, strategy: "catalog-discovery", results: products.slice(0, 3).map((product, index) => ({ rank: index + 1, reasonCode: "COLD_START_DISCOVERY" as const, reason: reasonCopy.COLD_START_DISCOVERY(), product })) };
  }
}

export const recommendationService = new RecommendationService(aiServiceClient, productRepository, wishlistRepository, cartRepository);
