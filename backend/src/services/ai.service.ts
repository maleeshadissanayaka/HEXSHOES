import { env } from "../config/env.js";

export interface AiSearchResult { rank: number; productId: string; similarityScore: number }
export interface AiSearchResponse { queryType: "image" | "text"; results: AiSearchResult[] }
export class AiServiceUnavailableError extends Error {}
export class AiServiceResponseError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export class AiServiceClient {
  constructor(private readonly baseUrl: string, private readonly timeoutMs: number) {}

  private async request(path: string, init: RequestInit, requestedTopK: number, expectedQueryType: AiSearchResponse["queryType"]): Promise<AiSearchResponse> {
    let response: Response;
    try { response = await fetch(`${this.baseUrl}${path}`, { ...init, signal: AbortSignal.timeout(this.timeoutMs) }); }
    catch (error) { throw new AiServiceUnavailableError("AI service request failed", { cause: error }); }
    if (!response.ok) throw new AiServiceUnavailableError("AI service is unavailable");
    let payload: unknown;
    try { payload = await response.json(); } catch (error) { throw new AiServiceResponseError("AI service returned invalid JSON", { cause: error }); }
    if (!isRecord(payload) || payload.success !== true || !isRecord(payload.data) || !Array.isArray(payload.data.results) || (payload.data.queryType !== "image" && payload.data.queryType !== "text")) throw new AiServiceResponseError("AI service response is malformed");
    if (payload.data.queryType !== expectedQueryType) throw new AiServiceResponseError("AI service query type is malformed");
    const seen = new Set<string>();
    const seenRanks = new Set<number>();
    const results: AiSearchResult[] = payload.data.results.map((item) => {
      if (!isRecord(item) || typeof item.productId !== "string" || item.productId.trim() === "" || !Number.isInteger(item.rank) || (item.rank as number) < 1 || typeof item.similarityScore !== "number" || !Number.isFinite(item.similarityScore) || seen.has(item.productId) || seenRanks.has(item.rank as number)) throw new AiServiceResponseError("AI service result is malformed");
      seen.add(item.productId);
      seenRanks.add(item.rank as number);
      return { rank: item.rank as number, productId: item.productId, similarityScore: item.similarityScore };
    });
    if (results.length > requestedTopK) throw new AiServiceResponseError("AI service returned too many results");
    if (results.some((result, index) => result.rank !== index + 1)) throw new AiServiceResponseError("AI service ranking is malformed");
    return { queryType: payload.data.queryType, results };
  }

  searchImage(image: { buffer: Buffer; mimeType: string; filename: string }, topK: number) {
    const form = new FormData();
    form.set("image", new Blob([new Uint8Array(image.buffer)], { type: image.mimeType }), image.filename);
    form.set("topK", String(topK));
    return this.request("/search/image", { method: "POST", body: form }, topK, "image");
  }

  searchText(query: string, topK: number) {
    return this.request("/search/text", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ query, topK }) }, topK, "text");
  }
}

export const aiServiceClient = new AiServiceClient(env.aiService.baseUrl, env.aiService.timeoutMs);
