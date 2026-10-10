import { describe, expect, it } from "vitest";
import { FixtureProductRepository } from "../src/repositories/fixtureProduct.repository.js";
import type { UserRepository } from "../src/repositories/user.repository.js";
import type { WishlistEntry, WishlistRepository } from "../src/repositories/wishlist.repository.js";
import { UserService } from "../src/services/user.service.js";
import { WishlistService } from "../src/services/wishlist.service.js";
import type { UserProfile } from "../src/types/user.js";

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
