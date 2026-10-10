import assert from "node:assert/strict";
import test from "node:test";
import { adaptProduct } from "../src/services/api/productAdapter.ts";
import { productsForAudience } from "../src/services/productCollections.ts";
import type { Product } from "../src/types/product.ts";

const apiProduct = {
  id: "hx-01", code: "HX-01", name: "HEX Runner", category: "running",
  audience: "unisex", price: 128, currency: "USD",
  description: "Runner description", shortDescription: "Runner",
  image: "/media/presentation/runner-960.webp",
  images: ["/media/presentation/runner-960.webp"], colors: [], sizes: [8, 9], isNew: true,
} as const;

test("adapts a valid API product into the product-card shape", () => {
  const product = adaptProduct(apiProduct);
  assert.equal(product.style, "runner");
  assert.equal(product.image, "/media/presentation/runner-960.webp");
  assert.deepEqual(product.sizes, [8, 9]);
});

test("rejects invalid API product responses", () => {
  assert.throws(() => adaptProduct({ ...apiProduct, price: "128" }), /API contract/);
});

test("men and women collections each include unisex without inventing audience data", () => {
  const unisex = adaptProduct(apiProduct);
  const men = { ...unisex, id: "men-1", audience: "men" } satisfies Product;
  const women = { ...unisex, id: "women-1", audience: "women" } satisfies Product;
  const catalog = [unisex, men, women];
  assert.deepEqual(productsForAudience("men", catalog).map(({ id }) => id), ["hx-01", "men-1"]);
  assert.deepEqual(productsForAudience("women", catalog).map(({ id }) => id), ["hx-01", "women-1"]);
});
