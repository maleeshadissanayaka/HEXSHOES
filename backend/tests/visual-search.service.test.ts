import { describe, expect, it } from "vitest";
import { AiServiceClient, AiServiceResponseError, type AiSearchResponse } from "../src/services/ai.service.js";
import { VisualSearchService } from "../src/services/visualSearch.service.js";
import { FixtureProductRepository } from "../src/repositories/fixtureProduct.repository.js";

describe("AI service client response validation", () => {
  it("accepts ranked finite unique identifiers", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ success: true, data: { queryType: "text", results: [{ rank: 1, productId: "hx-01", similarityScore: 0.5 }] } }), { status: 200 });
    try { await expect(new AiServiceClient("http://127.0.0.1:8000", 100).searchText("shoe", 4)).resolves.toEqual({ queryType: "text", results: [{ rank: 1, productId: "hx-01", similarityScore: 0.5 }] }); }
    finally { globalThis.fetch = original; }
  });

  const malformedCases: Array<Array<{ rank: number; productId: string; similarityScore: number }>> = [
    [{ rank: 0, productId: "hx-01", similarityScore: 0.5 }],
    [{ rank: 1, productId: "hx-01", similarityScore: Number.NaN }],
    [{ rank: 1, productId: "hx-01", similarityScore: 0.5 }, { rank: 2, productId: "hx-01", similarityScore: 0.4 }],
    [{ rank: 2, productId: "hx-01", similarityScore: 0.5 }],
  ];
  it.each(malformedCases)("rejects malformed AI results", async (results) => {
    const original = globalThis.fetch;
    globalThis.fetch = async () => new Response(JSON.stringify({ success: true, data: { queryType: "text", results } }), { status: 200 });
    try { await expect(new AiServiceClient("http://127.0.0.1:8000", 100).searchText("shoe", 4)).rejects.toBeInstanceOf(AiServiceResponseError); }
    finally { globalThis.fetch = original; }
  });

  it("turns request timeouts into controlled unavailability", async () => {
    const original = globalThis.fetch;
    globalThis.fetch = async (_input, init) => new Promise((_resolve, reject) => init?.signal?.addEventListener("abort", () => reject(init.signal?.reason)));
    try { await expect(new AiServiceClient("http://127.0.0.1:8000", 5).searchText("shoe", 4)).rejects.toMatchObject({ name: "Error", message: "AI service request failed" }); }
    finally { globalThis.fetch = original; }
  });
});

describe("visual search canonical product resolution", () => {
  it("preserves ranking and safely skips unknown product IDs", async () => {
    const response: AiSearchResponse = { queryType: "text", results: [{ rank: 1, productId: "missing", similarityScore: 0.9 }, { rank: 2, productId: "hx-02", similarityScore: 0.4 }] };
    const ai = { searchText: async () => response, searchImage: async () => response } as unknown as AiServiceClient;
    const service = new VisualSearchService(ai, new FixtureProductRepository());
    await expect(service.text("trail", 4)).resolves.toEqual({ queryType: "text", results: [expect.objectContaining({ rank: 2, similarityScore: 0.4, product: expect.objectContaining({ id: "hx-02" }) })] });
  });
});
