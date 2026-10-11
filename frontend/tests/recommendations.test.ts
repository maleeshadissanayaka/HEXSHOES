import assert from "node:assert/strict";
import test from "node:test";
import { excludeRecommendationProduct, recommendationDisclosure, recommendationHeading } from "../src/components/products/recommendationState.ts";

test("recommendation helpers exclude the source product and use honest copy", () => {
  const items = [{ product: { id: "hx-01" } }, { product: { id: "hx-02" } }];
  assert.deepEqual(excludeRecommendationProduct(items, "hx-01").map((item) => item.product.id), ["hx-02"]);
  assert.equal(recommendationHeading(true), "Recommended for you.");
  assert.doesNotMatch(recommendationDisclosure(true), /probability|confidence|%/i);
});

test("cold start remains honestly labeled", () => {
  assert.equal(recommendationHeading(false), "Catalog discovery.");
  assert.match(recommendationDisclosure(false), /not personalized/);
});

