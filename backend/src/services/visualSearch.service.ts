import { productRepository } from "../repositories/index.js";
import type { ProductRepository } from "../repositories/product.repository.js";
import { aiServiceClient, type AiSearchResponse } from "./ai.service.js";

export class VisualSearchService {
  constructor(private readonly ai: typeof aiServiceClient, private readonly products: ProductRepository) {}

  private async resolve(response: AiSearchResponse) {
    const resolved = await Promise.all(response.results.map(async (result) => ({ result, product: await this.products.findById(result.productId) })));
    return { queryType: response.queryType, results: resolved.filter((item) => item.product !== undefined).map(({ result, product }) => ({ rank: result.rank, similarityScore: result.similarityScore, product: product! })) };
  }

  async image(image: { buffer: Buffer; mimeType: string; filename: string }, topK: number) { return this.resolve(await this.ai.searchImage(image, topK)); }
  async text(query: string, topK: number) { return this.resolve(await this.ai.searchText(query, topK)); }
}

export const visualSearchService = new VisualSearchService(aiServiceClient, productRepository);
