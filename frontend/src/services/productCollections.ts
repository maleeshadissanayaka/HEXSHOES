import type { Product, ProductAudience } from "../types/product";

/** Audience collections intentionally include shared unisex catalog records. */
export function productsForAudience(
  audience: Exclude<ProductAudience, "unisex">,
  products: readonly Product[],
): Product[] {
  return products.filter(
    (product) => product.audience === audience || product.audience === "unisex",
  );
}
