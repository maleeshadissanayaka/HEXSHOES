import { products } from "../data/products.js";
import type { Product, ProductFilters } from "../types/product.js";

export const getProducts = (filters: ProductFilters = {}): readonly Product[] =>
  products.filter((product) =>
    (filters.category === undefined || product.category === filters.category) &&
    (filters.audience === undefined || product.audience === filters.audience) &&
    (filters.isNew === undefined || product.isNew === filters.isNew));

export const getProductById = (id: string): Product | undefined =>
  products.find((product) => product.id === id.toLowerCase());
