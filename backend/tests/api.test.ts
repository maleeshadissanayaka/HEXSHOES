import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DecodedIdToken } from "firebase-admin/auth";

const mocks = vi.hoisted(() => ({
  verifyFirebaseIdToken: vi.fn(),
  ensureProfile: vi.fn(), getProfile: vi.fn(), updateDisplayName: vi.fn(),
  listWishlist: vi.fn(), addWishlist: vi.fn(), removeWishlist: vi.fn(),
  listCart: vi.fn(), addCart: vi.fn(), updateCart: vi.fn(), removeCart: vi.fn(), clearCart: vi.fn(),
  searchImage: vi.fn(), searchText: vi.fn(), searchMultimodal: vi.fn(),
  similarRecommendations: vi.fn(), personalizedRecommendations: vi.fn(),
  agentMessage: vi.fn(), agentConfirm: vi.fn(),
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
vi.mock("../src/services/cart.service.js", () => ({ cartService: {
  list: mocks.listCart, add: mocks.addCart, update: mocks.updateCart, remove: mocks.removeCart, clear: mocks.clearCart,
} }));
vi.mock("../src/services/visualSearch.service.js", () => ({ visualSearchService: {
  image: mocks.searchImage, text: mocks.searchText, multimodal: mocks.searchMultimodal,
} }));
vi.mock("../src/services/recommendation.service.js", () => ({ recommendationService: {
  similar: mocks.similarRecommendations, personalized: mocks.personalizedRecommendations,
} }));
vi.mock("../src/agent/agent.orchestrator.js", () => ({ agentOrchestrator: {
  message: mocks.agentMessage, confirm: mocks.agentConfirm,
} }));
import app from "../src/app.js";
import { AiServiceResponseError, AiServiceUnavailableError } from "../src/services/ai.service.js";

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

  it("serves public agent messages with bounded structured output", async () => {
    mocks.agentMessage.mockResolvedValue({ reply: "HEX Trail is the closest match.", intent: "PRODUCT_SEARCH", products: [], suggestedPrompts: [], context: { referencedProductIds: [], lastIntent: "PRODUCT_SEARCH" } });
    const response = await request(app).post("/api/agent/message").send({ message: "show me a trail shoe", context: { referencedProductIds: ["hx-02"] } });
    expect(response.status).toBe(200); expect(response.body.data.intent).toBe("PRODUCT_SEARCH");
    expect(mocks.agentMessage).toHaveBeenCalledWith("show me a trail shoe", { referencedProductIds: ["hx-02"] }, undefined);
  });

  it("requires auth for confirmation and executes with verified identity", async () => {
    expect((await request(app).post("/api/agent/confirm").send({ confirmationToken: "signed" })).status).toBe(401);
    mocks.verifyFirebaseIdToken.mockResolvedValue({ uid: "user-123" } as DecodedIdToken);
    mocks.agentConfirm.mockResolvedValue({ reply: "Done", intent: "CART_ADD", suggestedPrompts: [], context: { referencedProductIds: [] } });
    const response = await request(app).post("/api/agent/confirm").set("Authorization", "Bearer valid-token").send({ confirmationToken: "signed" });
    expect(response.status).toBe(200); expect(mocks.agentConfirm).toHaveBeenCalledWith("signed", expect.objectContaining({ uid: "user-123" }));
  });

  it("honestly reports service status", async () => {
    const response = await request(app).get("/api/status");
    expect(response.status).toBe(200);
    expect(response.body.data).toMatchObject({
      backend: "READY", database: "FIXTURE", authentication: "READY",
      aiService: { configured: true }, commerce: "FOUNDATION",
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

  it.each(["/api/profile", "/api/wishlist", "/api/cart"])("protects %s", async (path) => {
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

  it("uses only the token uid for cart operations", async () => {
    mocks.verifyFirebaseIdToken.mockResolvedValue({ uid: "owner-a", firebase: { sign_in_provider: "password" } } as unknown as DecodedIdToken);
    mocks.addCart.mockResolvedValueOnce({ product: { id: "hx-01" }, quantity: 2 });
    const response = await request(app).post("/api/cart/hx-01").set("Authorization", "Bearer token").send({ uid: "owner-b", quantity: 2 });
    expect(response.status).toBe(200);
    expect(mocks.addCart).toHaveBeenCalledWith("owner-a", "hx-01", { uid: "owner-b", quantity: 2 });
  });

  it("maps cart validation and missing products to safe errors", async () => {
    mocks.verifyFirebaseIdToken.mockResolvedValue({ uid: "owner-a", firebase: { sign_in_provider: "password" } } as unknown as DecodedIdToken);
    mocks.addCart.mockRejectedValueOnce(new Error("INVALID_QUANTITY"));
    expect((await request(app).post("/api/cart/hx-01").set("Authorization", "Bearer token").send({ quantity: 0 })).status).toBe(400);
    mocks.addCart.mockRejectedValueOnce(new Error("PRODUCT_NOT_FOUND"));
    expect((await request(app).post("/api/cart/missing").set("Authorization", "Bearer token").send({ quantity: 1 })).status).toBe(404);
  });

  it("lists, updates, removes, and clears the authenticated cart", async () => {
    mocks.verifyFirebaseIdToken.mockResolvedValue({ uid: "owner-a", firebase: { sign_in_provider: "password" } } as unknown as DecodedIdToken);
    mocks.listCart.mockResolvedValueOnce([]); mocks.updateCart.mockResolvedValueOnce({ quantity: 3 }); mocks.removeCart.mockResolvedValueOnce({ productId: "hx-01" }); mocks.clearCart.mockResolvedValueOnce({ cleared: true });
    expect((await request(app).get("/api/cart").set("Authorization", "Bearer token")).status).toBe(200);
    expect((await request(app).patch("/api/cart/hx-01").set("Authorization", "Bearer token").send({ quantity: 3 })).status).toBe(200);
    expect((await request(app).delete("/api/cart/hx-01").set("Authorization", "Bearer token")).status).toBe(200);
    expect((await request(app).delete("/api/cart").set("Authorization", "Bearer token")).status).toBe(200);
    expect(mocks.updateCart).toHaveBeenCalledWith("owner-a", "hx-01", { quantity: 3 });
    expect(mocks.removeCart).toHaveBeenCalledWith("owner-a", "hx-01");
    expect(mocks.clearCart).toHaveBeenCalledWith("owner-a");
  });

  it("validates visual-search image uploads", async () => {
    expect((await request(app).post("/api/visual-search")).status).toBe(400);
    expect((await request(app).post("/api/visual-search").attach("image", Buffer.from("text"), { filename: "query.txt", contentType: "text/plain" })).status).toBe(400);
    expect((await request(app).post("/api/visual-search").attach("image", Buffer.alloc(5 * 1024 * 1024 + 1), { filename: "large.png", contentType: "image/png" })).status).toBe(400);
    expect((await request(app).post("/api/visual-search").attach("image", Buffer.from("not a png"), { filename: "spoofed.png", contentType: "image/png" })).status).toBe(400);
    expect(mocks.searchImage).not.toHaveBeenCalled();
  });

  it("forwards a valid in-memory image and returns resolved ranked results", async () => {
    mocks.searchImage.mockResolvedValueOnce({ queryType: "image", results: [{ rank: 1, similarityScore: 0.82, product: { id: "hx-01", name: "HEX Runner" } }] });
    const response = await request(app).post("/api/visual-search").field("topK", "1").attach("image", Buffer.from("RIFF0000WEBPimage"), { filename: "query.webp", contentType: "image/webp" });
    expect(response.status).toBe(200);
    expect(response.body.data.results[0]).toMatchObject({ rank: 1, similarityScore: 0.82, product: { id: "hx-01" } });
    expect(mocks.searchImage).toHaveBeenCalledWith(expect.objectContaining({ mimeType: "image/webp", filename: "query.webp" }), 1);
  });

  it("supports text-to-product visual search", async () => {
    mocks.searchText.mockResolvedValueOnce({ queryType: "text", results: [{ rank: 1, similarityScore: 0.3, product: { id: "hx-02" } }] });
    const response = await request(app).post("/api/visual-search/text").send({ query: "trail shoe", topK: 4 });
    expect(response.status).toBe(200);
    expect(mocks.searchText).toHaveBeenCalledWith("trail shoe", 4);
  });

  it("returns controlled errors for unavailable or malformed AI responses", async () => {
    mocks.searchImage.mockRejectedValueOnce(new AiServiceUnavailableError("internal URL"));
    const unavailable = await request(app).post("/api/visual-search").attach("image", Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]), { filename: "query.png", contentType: "image/png" });
    expect(unavailable.status).toBe(503); expect(unavailable.text).not.toContain("internal URL");
    mocks.searchText.mockRejectedValueOnce(new AiServiceResponseError("Python detail"));
    const malformed = await request(app).post("/api/visual-search/text").send({ query: "shoe" });
    expect(malformed.status).toBe(503); expect(malformed.text).not.toContain("Python detail");
  });

  it("returns real similar-product orchestration and handles failures", async () => {
    mocks.similarRecommendations.mockResolvedValueOnce([{ rank: 1, score: 0.6, reason: "Visually similar to this style", reasonCode: "SIMILAR_TO_CURRENT_PRODUCT", product: { id: "hx-02" } }]);
    const response = await request(app).get("/api/products/hx-01/similar");
    expect(response.status).toBe(200); expect(response.body.data.results[0].product.id).toBe("hx-02");
    mocks.similarRecommendations.mockRejectedValueOnce(new Error("PRODUCT_NOT_FOUND"));
    expect((await request(app).get("/api/products/missing/similar")).status).toBe(404);
    mocks.similarRecommendations.mockRejectedValueOnce(new AiServiceUnavailableError("offline"));
    expect((await request(app).get("/api/products/hx-01/similar")).status).toBe(503);
  });

  it("protects personalized recommendations and uses only the authenticated uid", async () => {
    expect((await request(app).get("/api/recommendations")).status).toBe(401);
    mocks.verifyFirebaseIdToken.mockResolvedValueOnce({ uid: "owner-a", firebase: { sign_in_provider: "password" } } as unknown as DecodedIdToken);
    mocks.personalizedRecommendations.mockResolvedValueOnce({ personalized: false, strategy: "catalog-discovery", results: [] });
    const response = await request(app).get("/api/recommendations").set("Authorization", "Bearer token");
    expect(response.status).toBe(200); expect(mocks.personalizedRecommendations).toHaveBeenCalledWith("owner-a");
  });

  it("supports image-only, text-only, and fused multimodal searches", async () => {
    mocks.searchMultimodal.mockResolvedValue({ queryType: "multimodal", queryMode: "image+text", results: [] });
    const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
    expect((await request(app).post("/api/visual-search/multimodal").attach("image", png, { filename: "query.png", contentType: "image/png" })).status).toBe(200);
    expect((await request(app).post("/api/visual-search/multimodal").field("text", "trail shoe")).status).toBe(200);
    expect((await request(app).post("/api/visual-search/multimodal").field("text", "trail shoe").attach("image", png, { filename: "query.png", contentType: "image/png" })).status).toBe(200);
    expect((await request(app).post("/api/visual-search/multimodal")).status).toBe(400);
    mocks.searchMultimodal.mockRejectedValueOnce(new AiServiceUnavailableError("offline"));
    expect((await request(app).post("/api/visual-search/multimodal").field("text", "shoe")).status).toBe(503);
  });
});
