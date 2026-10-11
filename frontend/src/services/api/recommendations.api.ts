import type { User } from "firebase/auth";
import type { Product } from "../../types/product";
import { ApiError, apiGet } from "./apiClient";
import { authenticatedGet } from "./authenticatedRequest";
import { adaptProduct } from "./productAdapter";

export interface RecommendationResult { rank: number; score?: number; reasonCode: string; reason: string; product: Product }
export interface RecommendationResponse { personalized: boolean; strategy: string; results: RecommendationResult[] }
const record = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
export function parseRecommendationResponse(value: unknown, personalizedDefault: boolean): RecommendationResponse {
  if (!record(value) || value.success !== true || !record(value.data) || typeof value.data.strategy !== "string" || !Array.isArray(value.data.results)) throw new ApiError("The API returned invalid recommendations.");
  const seen = new Set<string>();
  const results = value.data.results.map((item, index) => {
    if (!record(item) || item.rank !== index + 1 || typeof item.reasonCode !== "string" || typeof item.reason !== "string" || (item.score !== undefined && (typeof item.score !== "number" || !Number.isFinite(item.score)))) throw new ApiError("The API returned invalid recommendations.");
    const product = adaptProduct(item.product);
    if (seen.has(product.id)) throw new ApiError("The API returned invalid recommendations.");
    seen.add(product.id);
    return { rank: item.rank as number, ...(typeof item.score === "number" ? { score: item.score } : {}), reasonCode: item.reasonCode, reason: item.reason, product };
  });
  return { personalized: typeof value.data.personalized === "boolean" ? value.data.personalized : personalizedDefault, strategy: value.data.strategy, results };
}
export async function getSimilarProducts(productId: string, signal?: AbortSignal) {
  return parseRecommendationResponse(await apiGet(`/products/${encodeURIComponent(productId)}/similar`, signal), false);
}
export async function getPersonalizedRecommendations(user: User, signal?: AbortSignal) {
  return parseRecommendationResponse(await authenticatedGet(user, apiGet, "/recommendations", signal), true);
}
