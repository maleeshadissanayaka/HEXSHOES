import { describe, expect, it } from "vitest";
import { FixtureProductRepository } from "../src/repositories/fixtureProduct.repository.js";
import { MalformedProductDocumentError, mapFirestoreProduct } from "../src/repositories/firestoreProduct.repository.js";
import { ProductService } from "../src/services/product.service.js";

const service = new ProductService(new FixtureProductRepository());

describe("ProductService with fixture repository", () => {
  it("filters by audience and new-product state", async () => {
    const products = await service.getProducts({ audience: "unisex", isNew: true });
    expect(products.map((product) => product.id)).toEqual(["hx-01", "hx-02"]);
  });

  it("normalizes product IDs", async () => {
    await expect(service.getProductById(" HX-01 ")).resolves.toMatchObject({ id: "hx-01" });
  });

  it("treats a missing ID as not found", async () => {
    await expect(service.getProductById("   ")).resolves.toBeUndefined();
  });
});

describe("Firestore product mapping", () => {
  it("rejects malformed documents instead of blindly casting", () => {
    expect(() => mapFirestoreProduct("hx-bad", { id: "hx-bad", name: "Incomplete" }))
      .toThrow(MalformedProductDocumentError);
  });
});
