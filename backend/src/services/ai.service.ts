import { env } from "../config/env.js";

export interface AiSearchResult { rank: number; productId: string; similarityScore: number }
export interface AiSearchResponse { queryType: "image" | "text" | "multimodal"; queryMode?: "image" | "text" | "image+text"; results: AiSearchResult[] }
export type RecommendationReasonCode = "SIMILAR_TO_CURRENT_PRODUCT" | "SIMILAR_TO_WISHLIST" | "SIMILAR_TO_CART";
export interface AiRecommendationResult { rank: number; productId: string; score: number; reasonCode: RecommendationReasonCode; reasonProductId?: string }
export class AiServiceUnavailableError extends Error {}
export class AiServiceResponseError extends Error {}

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);

export class AiServiceClient {
  constructor(private readonly baseUrl: string, private readonly timeoutMs: number) {}

  private async fetchPayload(path: string, init: RequestInit): Promise<Record<string, unknown>> {
    let response: Response;
    try { response = await fetch(`${this.baseUrl}${path}`, { ...init, signal: AbortSignal.timeout(this.timeoutMs) }); }
    catch (error) { throw new AiServiceUnavailableError("AI service request failed", { cause: error }); }
    if (!response.ok) throw new AiServiceUnavailableError("AI service is unavailable");
    let payload: unknown;
    try { payload = await response.json(); } catch (error) { throw new AiServiceResponseError("AI service returned invalid JSON", { cause: error }); }
    if (!isRecord(payload) || payload.success !== true || !isRecord(payload.data)) throw new AiServiceResponseError("AI service response is malformed");
    return payload.data;
  }

  private async request(path: string, init: RequestInit, requestedTopK: number, expectedQueryType: AiSearchResponse["queryType"]): Promise<AiSearchResponse> {
    const data = await this.fetchPayload(path, init);
    if (!Array.isArray(data.results) || (data.queryType !== "image" && data.queryType !== "text" && data.queryType !== "multimodal")) throw new AiServiceResponseError("AI service response is malformed");
    if (data.queryType !== expectedQueryType) throw new AiServiceResponseError("AI service query type is malformed");
    const seen = new Set<string>();
    const seenRanks = new Set<number>();
    const results: AiSearchResult[] = data.results.map((item) => {
      if (!isRecord(item) || typeof item.productId !== "string" || item.productId.trim() === "" || !Number.isInteger(item.rank) || (item.rank as number) < 1 || typeof item.similarityScore !== "number" || !Number.isFinite(item.similarityScore) || seen.has(item.productId) || seenRanks.has(item.rank as number)) throw new AiServiceResponseError("AI service result is malformed");
      seen.add(item.productId);
      seenRanks.add(item.rank as number);
      return { rank: item.rank as number, productId: item.productId, similarityScore: item.similarityScore };
    });
    if (results.length > requestedTopK) throw new AiServiceResponseError("AI service returned too many results");
    if (results.some((result, index) => result.rank !== index + 1)) throw new AiServiceResponseError("AI service ranking is malformed");
    const queryMode = data.queryMode as AiSearchResponse["queryMode"];
    if (expectedQueryType === "multimodal" && queryMode !== "image" && queryMode !== "text" && queryMode !== "image+text") throw new AiServiceResponseError("AI service query mode is malformed");
    return { queryType: data.queryType, ...(queryMode ? { queryMode } : {}), results };
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

  searchMultimodal(input: { image?: { buffer: Buffer; mimeType: string; filename: string }; text?: string }, topK: number) {
    const form = new FormData();
    if (input.image) form.set("image", new Blob([new Uint8Array(input.image.buffer)], { type: input.image.mimeType }), input.image.filename);
    if (input.text) form.set("text", input.text);
    form.set("topK", String(topK)); form.set("imageWeight", "0.6"); form.set("textWeight", "0.4");
    return this.request("/search/multimodal", { method: "POST", body: form }, topK, "multimodal");
  }

  async similarProducts(productId: string, topK: number): Promise<AiRecommendationResult[]> {
    const data = await this.fetchPayload(`/recommend/similar/${encodeURIComponent(productId)}?topK=${topK}`, { method: "GET" });
    return this.recommendationResults(data, topK, false);
  }

  async userRecommendations(interactions: Array<{ productId: string; signal: "wishlist" | "cart"; weight: number }>, topK: number): Promise<AiRecommendationResult[]> {
    const data = await this.fetchPayload("/recommend/user", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ interactions, topK }) });
    return this.recommendationResults(data, topK, true);
  }

  private recommendationResults(data: Record<string, unknown>, topK: number, requireEvidence: boolean): AiRecommendationResult[] {
    if (!Array.isArray(data.results)) throw new AiServiceResponseError("AI recommendation response is malformed");
    const ids = new Set<string>();
    return data.results.map((item, index) => {
      if (!isRecord(item) || item.rank !== index + 1 || typeof item.productId !== "string" || ids.has(item.productId) || typeof item.reasonCode !== "string") throw new AiServiceResponseError("AI recommendation result is malformed");
      const score = typeof item.score === "number" ? item.score : item.similarityScore;
      if (typeof score !== "number" || !Number.isFinite(score) || (requireEvidence && (typeof item.reasonProductId !== "string" || item.reasonProductId.trim() === ""))) throw new AiServiceResponseError("AI recommendation result is malformed");
      if (!["SIMILAR_TO_CURRENT_PRODUCT", "SIMILAR_TO_WISHLIST", "SIMILAR_TO_CART"].includes(item.reasonCode) || index >= topK) throw new AiServiceResponseError("AI recommendation result is malformed");
      ids.add(item.productId);
      return { rank: item.rank as number, productId: item.productId, score, reasonCode: item.reasonCode as RecommendationReasonCode, ...(typeof item.reasonProductId === "string" ? { reasonProductId: item.reasonProductId } : {}) };
    });
  }
}

export const aiServiceClient = new AiServiceClient(env.aiService.baseUrl, env.aiService.timeoutMs);
