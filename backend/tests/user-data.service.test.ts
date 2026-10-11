import { describe, expect, it } from "vitest";
import { FixtureProductRepository } from "../src/repositories/fixtureProduct.repository.js";
import type { UserRepository } from "../src/repositories/user.repository.js";
import type { WishlistEntry, WishlistRepository } from "../src/repositories/wishlist.repository.js";
import { UserService } from "../src/services/user.service.js";
import { WishlistService } from "../src/services/wishlist.service.js";
import type { UserProfile } from "../src/types/user.js";
import type { CartEntry, CartRepository } from "../src/repositories/cart.repository.js";
import { CartService } from "../src/services/cart.service.js";

class MemoryUsers implements UserRepository {
  profiles = new Map<string, UserProfile>();
  async findByUid(uid: string) { return this.profiles.get(uid); }
  async upsertFromAuth(user: { uid: string; email?: string; name?: string; picture?: string; provider?: string }) {
    const existing = this.profiles.get(user.uid);
    if (existing) return existing;
    const profile = { uid: user.uid, email: user.email, displayName: user.name, photoURL: user.picture, provider: user.provider, createdAt: "created", updatedAt: "created" };
    this.profiles.set(user.uid, profile); return profile;
  }
  async updateProfile(uid: string, input: { displayName: string }) {
    const next = { ...this.profiles.get(uid)!, ...input, updatedAt: "updated" };
    this.profiles.set(uid, next); return next;
  }
}

class MemoryWishlist implements WishlistRepository {
  entries = new Map<string, Set<string>>();
  private for(uid: string) { const value = this.entries.get(uid) ?? new Set<string>(); this.entries.set(uid, value); return value; }
  async findAll(uid: string): Promise<WishlistEntry[]> { return [...this.for(uid)].map((productId) => ({ productId, addedAt: "now" })); }
  async add(uid: string, productId: string) { this.for(uid).add(productId); }
  async remove(uid: string, productId: string) { this.for(uid).delete(productId); }
  async has(uid: string, productId: string) { return this.for(uid).has(productId); }
}

class MemoryCart implements CartRepository {
  entries = new Map<string, Map<string, CartEntry>>();
  private for(uid: string) { const value = this.entries.get(uid) ?? new Map<string, CartEntry>(); this.entries.set(uid, value); return value; }
  async findAll(uid: string) { return [...this.for(uid).values()]; }
  async setQuantity(uid: string, productId: string, quantity: number, size?: string) { const previous = this.for(uid).get(productId); const entry = { productId, quantity, ...(size ? { size } : {}), addedAt: previous?.addedAt ?? "now", updatedAt: "now" }; this.for(uid).set(productId, entry); return entry; }
  async add(uid: string, productId: string, quantity: number, maximum: number, size?: string) { const current = this.for(uid).get(productId)?.quantity ?? 0; return this.setQuantity(uid, productId, Math.min(maximum, current + quantity), size); }
  async remove(uid: string, productId: string) { this.for(uid).delete(productId); }
  async clear(uid: string) { this.for(uid).clear(); }
}

describe("user profile service", () => {
  it("creates once from auth and safely updates displayName", async () => {
    const repository = new MemoryUsers(); const service = new UserService(repository);
    await service.ensureProfile({ uid: "a", email: "a@example.com", name: "Initial" });
    await expect(service.updateDisplayName({ uid: "a" }, " New Name ")).resolves.toMatchObject({ uid: "a", email: "a@example.com", displayName: "New Name" });
    await expect(service.updateDisplayName({ uid: "a" }, " ")).rejects.toThrow("INVALID_DISPLAY_NAME");
  });
});

describe("wishlist service", () => {
  it("validates products, is idempotent, lists, removes, and isolates owners", async () => {
    const repository = new MemoryWishlist(); const service = new WishlistService(repository, new FixtureProductRepository());
    await service.add("a", "hx-01"); await service.add("a", "hx-01"); await service.add("b", "hx-02");
    expect((await service.list("a")).map(({ id }) => id)).toEqual(["hx-01"]);
    expect((await service.list("b")).map(({ id }) => id)).toEqual(["hx-02"]);
    await expect(service.add("a", "missing")).rejects.toThrow("PRODUCT_NOT_FOUND");
    await service.remove("a", "hx-01"); expect(await service.list("a")).toEqual([]);
  });
});

describe("cart service", () => {
  it("adds, increments, caps, updates, lists, removes, clears, and isolates owners", async () => {
    const repository = new MemoryCart(); const service = new CartService(repository, new FixtureProductRepository());
    await service.add("a", "hx-01", { quantity: 2, size: "9" });
    await service.add("a", "hx-01", { quantity: 9, size: "9" });
    await service.add("b", "hx-02", { quantity: 1, size: "10" });
    expect(await service.list("a")).toEqual([expect.objectContaining({ quantity: 10, product: expect.objectContaining({ id: "hx-01" }) })]);
    expect((await service.list("b"))[0]?.product.id).toBe("hx-02");
    await service.update("a", "hx-01", { quantity: 3, size: "9" });
    expect((await service.list("a"))[0]?.quantity).toBe(3);
    await service.remove("a", "hx-01"); expect(await service.list("a")).toEqual([]);
    await service.clear("b"); expect(await service.list("b")).toEqual([]);
  });

  it.each([0, -1, 1.5, 11, "2"])("rejects invalid quantity %s", async (quantity) => {
    await expect(new CartService(new MemoryCart(), new FixtureProductRepository()).add("a", "hx-01", { quantity })).rejects.toThrow("INVALID_QUANTITY");
  });

  it("rejects an invalid product", async () => {
    await expect(new CartService(new MemoryCart(), new FixtureProductRepository()).add("a", "missing")).rejects.toThrow("PRODUCT_NOT_FOUND");
  });
});
