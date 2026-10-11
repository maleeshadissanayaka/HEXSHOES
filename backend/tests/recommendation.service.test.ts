import { describe, expect, it } from "vitest";
import { RecommendationService, RECOMMENDATION_WEIGHTS } from "../src/services/recommendation.service.js";
import { FixtureProductRepository } from "../src/repositories/fixtureProduct.repository.js";
import type { WishlistRepository } from "../src/repositories/wishlist.repository.js";
import type { CartRepository } from "../src/repositories/cart.repository.js";
import type { AiServiceClient } from "../src/services/ai.service.js";

const wishlist = (ids: string[]): WishlistRepository => ({ findAll: async () => ids.map((productId) => ({ productId, addedAt: "now" })), add: async () => {}, remove: async () => {}, has: async () => false });
const cart = (entries: Array<{ productId: string; quantity: number }>): CartRepository => ({ findAll: async () => entries.map((item) => ({ ...item, addedAt: "now", updatedAt: "now" })), add: async () => { throw new Error(); }, setQuantity: async () => { throw new Error(); }, remove: async () => {}, clear: async () => {} });

describe("recommendation orchestration", () => {
  it("builds wishlist and quantity-capped cart signals, excludes interactions, and resolves evidence", async () => {
    let sent: unknown;
    const ai = { userRecommendations: async (interactions: unknown, topK: number) => { sent = { interactions, topK }; return [{ rank: 1, productId: "hx-03", score: 0.7, reasonCode: "SIMILAR_TO_WISHLIST", reasonProductId: "hx-01" }]; } } as unknown as AiServiceClient;
    const service = new RecommendationService(ai, new FixtureProductRepository(), wishlist(["hx-01"]), cart([{ productId: "hx-02", quantity: 10 }]));
    const result = await service.personalized("owner-a");
    expect(sent).toEqual({ interactions: [{ productId: "hx-01", signal: "wishlist", weight: 1 }, { productId: "hx-02", signal: "cart", weight: RECOMMENDATION_WEIGHTS.cartBase + RECOMMENDATION_WEIGHTS.cartQuantityStep * 3 }], topK: 2 });
    expect(result).toMatchObject({ personalized: true, results: [{ product: { id: "hx-03" }, reason: "Similar to HEX Runner in your wishlist" }] });
  });

  it("uses an honest deterministic cold start without invoking AI", async () => {
    const ai = { userRecommendations: async () => { throw new Error("must not run"); } } as unknown as AiServiceClient;
    const result = await new RecommendationService(ai, new FixtureProductRepository(), wishlist([]), cart([])).personalized("new-user");
    expect(result.personalized).toBe(false); expect(result.strategy).toBe("catalog-discovery");
    expect(result.results.every((item) => item.reasonCode === "COLD_START_DISCOVERY")).toBe(true);
  });

  it("derives available recommendation slots from the repository instead of a fixed catalog size", async () => {
    let requestedTopK = 0;
    const products = new FixtureProductRepository();
    const catalog = await products.findAll();
    const expanded = { findById: (id: string) => products.findById(id), findAll: async () => [...catalog, { ...catalog[0]!, id: "hx-05", code: "HX-05", name: "Fifth Style" }] };
    const ai = { userRecommendations: async (_interactions: unknown, topK: number) => { requestedTopK = topK; return []; } } as unknown as AiServiceClient;
    await new RecommendationService(ai, expanded, wishlist(["hx-01"]), cart([])).personalized("owner-a");
    expect(requestedTopK).toBe(3);
  });

  it("preserves similar ordering, excludes source, and skips unknown AI IDs", async () => {
    const ai = { similarProducts: async () => [{ rank: 1, productId: "missing", score: 0.9, reasonCode: "SIMILAR_TO_CURRENT_PRODUCT" }, { rank: 2, productId: "hx-02", score: 0.6, reasonCode: "SIMILAR_TO_CURRENT_PRODUCT" }] } as unknown as AiServiceClient;
    const result = await new RecommendationService(ai, new FixtureProductRepository(), wishlist([]), cart([])).similar("hx-01");
    expect(result.map(({ product }) => product.id)).toEqual(["hx-02"]);
  });
});
