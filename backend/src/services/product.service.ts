import { productRepository } from "../repositories/index.js";
import type { ProductRepository } from "../repositories/product.repository.js";
import type { Product, ProductFilters } from "../types/product.js";

export class ProductService {
  constructor(private readonly repository: ProductRepository) {}

  async getProducts(filters: ProductFilters = {}): Promise<readonly Product[]> {
    return this.repository.findAll(filters);
  }

  async getProductById(id: string): Promise<Product | undefined> {
    const normalizedId = id.trim().toLowerCase();
    if (normalizedId === "") return undefined;
    return this.repository.findById(normalizedId);
  }
}

export const productService = new ProductService(productRepository);
