import request from "supertest";
import { describe, expect, it } from "vitest";
import app from "../src/app.js";

describe("HEXSHOES API", () => {
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
      backend: "READY", database: "FIXTURE", authentication: "NOT_CONNECTED",
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
});
