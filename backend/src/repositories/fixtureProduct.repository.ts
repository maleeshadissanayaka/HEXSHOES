import { products } from "../data/products.js";
import type { Product, ProductFilters } from "../types/product.js";
import type { ProductRepository } from "./product.repository.js";

const matchesFilters = (product: Product, filters: ProductFilters): boolean =>
  (filters.category === undefined || product.category === filters.category) &&
  (filters.audience === undefined || product.audience === filters.audience) &&
  (filters.isNew === undefined || product.isNew === filters.isNew);

export class FixtureProductRepository implements ProductRepository {
  async findAll(filters: ProductFilters = {}): Promise<readonly Product[]> {
    return products.filter((product) => matchesFilters(product, filters));
  }

  async findById(id: string): Promise<Product | undefined> {
    return products.find((product) => product.id === id);
  }
}
