import request from "supertest";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { DecodedIdToken } from "firebase-admin/auth";

const mocks = vi.hoisted(() => ({ verifyFirebaseIdToken: vi.fn() }));
vi.mock("../src/services/tokenVerifier.js", () => ({
  verifyFirebaseIdToken: mocks.verifyFirebaseIdToken,
}));
import app from "../src/app.js";

describe("HEXSHOES API", () => {
  beforeEach(() => mocks.verifyFirebaseIdToken.mockReset());
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
  });
});
