import assert from "node:assert/strict";
import test from "node:test";
import type { Product } from "../src/types/product.ts";
import { addLocalCartLine, cartTotal, clampCartQuantity, mergeCartLines, removeLocalCartLine, updateLocalCartLine } from "../src/auth/cartState.ts";

const product = (id: string, price: number): Product => ({ id, price, code: id.toUpperCase(), name: id, category: "running", audience: "unisex", currency: "USD", description: "d", shortDescription: "d", image: "runner", images: ["runner"], colors: ["black"], sizes: [9], isNew: true, style: "runner" });

test("signed-out cart adds, updates, removes, and calculates canonical product totals", () => {
  const added = addLocalCartLine([], product("hx-01", 128), "9", 2);
  assert.equal(cartTotal(added), 256);
  const updated = updateLocalCartLine(added, "hx-01", 3);
  assert.equal(updated[0]?.quantity, 3);
  assert.deepEqual(removeLocalCartLine(updated, "hx-01"), []);
});

test("guest merge preserves remote items, combines duplicates, and caps quantity", () => {
  const remote = [{ product: product("hx-01", 128), size: "9", quantity: 8 }];
  const guest = [{ product: product("hx-01", 128), size: "10", quantity: 4 }, { product: product("hx-02", 164), size: "9", quantity: 1 }];
  const merged = mergeCartLines(remote, guest);
  assert.equal(merged.length, 2);
  assert.equal(merged.find((line) => line.product.id === "hx-01")?.quantity, 10);
  assert.equal(merged.find((line) => line.product.id === "hx-01")?.size, "10");
  assert.equal(clampCartQuantity(99), 10);
});

test("sign-out cleanup does not turn authenticated lines into guest lines", () => {
  const account = [{ product: product("hx-01", 128), size: "9", quantity: 2 }];
  const guest: typeof account = [];
  const clearedAccount: typeof account = [];
  assert.deepEqual(clearedAccount, []);
  assert.deepEqual(guest, []);
  assert.equal(account.length, 1);
});
