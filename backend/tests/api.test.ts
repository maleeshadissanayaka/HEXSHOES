import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DecodedIdToken } from "firebase-admin/auth";

const mocks = vi.hoisted(() => ({
  verifyFirebaseIdToken: vi.fn(),
  ensureProfile: vi.fn(), getProfile: vi.fn(), updateDisplayName: vi.fn(),
  listWishlist: vi.fn(), addWishlist: vi.fn(), removeWishlist: vi.fn(),
}));
vi.mock("../src/services/tokenVerifier.js", () => ({
  verifyFirebaseIdToken: mocks.verifyFirebaseIdToken,
}));
vi.mock("../src/services/user.service.js", () => ({ userService: {
  ensureProfile: mocks.ensureProfile, getProfile: mocks.getProfile, updateDisplayName: mocks.updateDisplayName,
} }));
vi.mock("../src/services/wishlist.service.js", () => ({ wishlistService: {
  list: mocks.listWishlist, add: mocks.addWishlist, remove: mocks.removeWishlist,
} }));
import app from "../src/app.js";

describe("HEXSHOES API", () => {
  beforeEach(() => {
    for (const mock of Object.values(mocks)) mock.mockReset();
    mocks.ensureProfile.mockResolvedValue({ uid: "user-123" });
  });
  it("reports health", async () => {
    const response = await request(app).get("/api/health");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: {
      service: "hexshoes-api", status: "ok", environment: "test",
    } });
  });

  it("honestly reports service status", async () => {
    const response = await request(app).get("/api/status");
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      backend: "READY", database: "FIXTURE", authentication: "READY",
      aiService: "NOT_CONNECTED", commerce: "FOUNDATION",
    });
  });

  it("returns all products", async () => {
    const response = await request(app).get("/api/products");
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveLength(4);
  });

  it("returns one product", async () => {
    const response = await request(app).get("/api/products/hx-01");
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({ id: "hx-01", code: "HX-01", name: "HEX Runner", price: 128, currency: "USD" });
  });

  it("returns 404 for an invalid product ID", async () => {
    const response = await request(app).get("/api/products/not-a-product");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, error: { message: "Product not found" } });
  });

  it("returns 404 for an unknown API route", async () => {
    const response = await request(app).get("/api/unknown");
    expect(response.status).toBe(404);
    expect(response.body).toEqual({ success: false, error: { message: "Route not found" } });
  });

  it("filters products by category", async () => {
    const response = await request(app).get("/api/products?category=running");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(1);
    expect(response.body.data[0].id).toBe("hx-01");
  });

  it("filters products by audience", async () => {
    const response = await request(app).get("/api/products?audience=unisex");
    expect(response.status).toBe(200);
    expect(response.body.data).toHaveLength(4);
    expect(response.body.data.every((product: { audience: string }) => product.audience === "unisex")).toBe(true);
  });

  it("filters new drops", async () => {
    const response = await request(app).get("/api/products?new=true");
    expect(response.status).toBe(200);
    expect(response.body.data.map((product: { id: string }) => product.id)).toEqual(["hx-01", "hx-02"]);
  });

  it.each(["http://127.0.0.1:5173", "http://localhost:5173"])(
    "allows the development frontend origin %s",
    async (origin) => {
      const response = await request(app).get("/api/products").set("Origin", origin);
      expect(response.headers["access-control-allow-origin"]).toBe(origin);
    },
  );

  it("does not allow an unrelated CORS origin", async () => {
    const response = await request(app).get("/api/products").set("Origin", "https://example.com");
    expect(response.headers["access-control-allow-origin"]).toBeUndefined();
  });

  it("keeps public routes available without authentication", async () => {
    expect((await request(app).get("/api/health")).status).toBe(200);
    expect((await request(app).get("/api/products")).status).toBe(200);
  });

  it("requires authorization for the current-user route", async () => {
    const response = await request(app).get("/api/me");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ success: false, error: { message: "Authentication required" } });
    expect(mocks.verifyFirebaseIdToken).not.toHaveBeenCalled();
  });

  it.each(["Basic credentials", "Bearer", "Bearer token with-spaces"])(
    "rejects malformed authorization: %s",
    async (authorization) => {
      const response = await request(app).get("/api/me").set("Authorization", authorization);
      expect(response.status).toBe(401);
      expect(response.body.error.message).toBe("Authentication required");
      expect(mocks.verifyFirebaseIdToken).not.toHaveBeenCalled();
    },
  );

  it("rejects an invalid Firebase ID token safely", async () => {
    mocks.verifyFirebaseIdToken.mockRejectedValueOnce(new Error("Firebase internal detail"));
    const response = await request(app).get("/api/me").set("Authorization", "Bearer invalid-token");
    expect(response.status).toBe(401);
    expect(response.body).toEqual({ success: false, error: { message: "Invalid or expired authentication" } });
    expect(response.text).not.toContain("Firebase internal detail");
  });

  it("returns only the safe authenticated-user projection for a valid token", async () => {
    mocks.verifyFirebaseIdToken.mockResolvedValueOnce({
      uid: "user-123", email: "member@example.com", email_verified: true,
      name: "HEX Member", picture: "https://example.test/avatar.png",
      firebase: { sign_in_provider: "google.com", identities: {} },
    } as unknown as DecodedIdToken);
    const response = await request(app).get("/api/me").set("Authorization", "Bearer valid-token");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ success: true, data: {
      uid: "user-123", email: "member@example.com", emailVerified: true,
      name: "HEX Member", picture: "https://example.test/avatar.png", provider: "google.com",
    } });
    expect(response.text).not.toContain("valid-token");
    expect(mocks.verifyFirebaseIdToken).toHaveBeenCalledWith("valid-token");
    expect(mocks.ensureProfile).toHaveBeenCalledWith(expect.objectContaining({ uid: "user-123" }));
  });

  it.each(["/api/profile", "/api/wishlist"])("protects %s", async (path) => {
    expect((await request(app).get(path)).status).toBe(401);
  });

  it("creates and returns the authenticated profile", async () => {
    mocks.verifyFirebaseIdToken.mockResolvedValueOnce({ uid: "profile-user", email: "member@example.com", firebase: { sign_in_provider: "password" } } as unknown as DecodedIdToken);
    mocks.getProfile.mockResolvedValueOnce({ uid: "profile-user", email: "member@example.com", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-01T00:00:00.000Z" });
    const response = await request(app).get("/api/profile").set("Authorization", "Bearer valid-token");
    expect(response.status).toBe(200);
    expect(mocks.getProfile).toHaveBeenCalledWith(expect.objectContaining({ uid: "profile-user" }));
  });

  it("allows only displayName profile updates", async () => {
    mocks.verifyFirebaseIdToken.mockResolvedValue({ uid: "profile-user", firebase: { sign_in_provider: "password" } } as unknown as DecodedIdToken);
    mocks.updateDisplayName.mockResolvedValueOnce({ uid: "profile-user", displayName: "HEX Member", createdAt: "2026-01-01T00:00:00.000Z", updatedAt: "2026-01-02T00:00:00.000Z" });
    expect((await request(app).patch("/api/profile").set("Authorization", "Bearer token").send({ displayName: "HEX Member" })).status).toBe(200);
    const rejected = await request(app).patch("/api/profile").set("Authorization", "Bearer token").send({ uid: "someone-else", displayName: "Name" });
    expect(rejected.status).toBe(400);
    expect(mocks.updateDisplayName).toHaveBeenCalledTimes(1);
  });

  it("uses the token uid for wishlist operations", async () => {
    mocks.verifyFirebaseIdToken.mockResolvedValue({ uid: "owner-a", firebase: { sign_in_provider: "password" } } as unknown as DecodedIdToken);
    mocks.addWishlist.mockResolvedValueOnce({ id: "hx-01" });
    const response = await request(app).post("/api/wishlist/hx-01").set("Authorization", "Bearer token");
    expect(response.status).toBe(200);
    expect(mocks.addWishlist).toHaveBeenCalledWith("owner-a", "hx-01");
  });

  it("rejects invalid wishlist products without leaking internals", async () => {
    mocks.verifyFirebaseIdToken.mockResolvedValueOnce({ uid: "owner-a", firebase: { sign_in_provider: "password" } } as unknown as DecodedIdToken);
    mocks.addWishlist.mockRejectedValueOnce(new Error("PRODUCT_NOT_FOUND"));
    const response = await request(app).post("/api/wishlist/missing").set("Authorization", "Bearer token");
    expect(response.status).toBe(404);
    expect(response.body.error.message).toBe("Product not found");
  });
});
