import type { Product, ProductFilters } from "../types/product.js";

export interface ProductRepository {
  findAll(filters?: ProductFilters): Promise<readonly Product[]>;
  findById(id: string): Promise<Product | undefined>;
}
