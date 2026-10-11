import type { Product } from "../../types/product";
import { ApiError, apiFormRequest, apiRequest } from "./apiClient";
import { adaptProduct } from "./productAdapter";
import { createMultimodalForm, createVisualSearchForm } from "../../components/home/visualSearchState";

export interface VisualSearchResult { rank: number; similarityScore: number; product: Product }
export interface VisualSearchResponse { queryType: "image" | "text" | "multimodal"; results: VisualSearchResult[] }
const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
export function parseVisualSearchResponse(value: unknown): VisualSearchResponse {
  if (!isRecord(value) || value.success !== true || !isRecord(value.data) || (value.data.queryType !== "image" && value.data.queryType !== "text" && value.data.queryType !== "multimodal") || !Array.isArray(value.data.results)) throw new ApiError("The API returned an invalid visual-search response.");
  const seen = new Set<string>();
  const results = value.data.results.map((item) => {
    if (!isRecord(item) || !Number.isInteger(item.rank) || (item.rank as number) < 1 || typeof item.similarityScore !== "number" || !Number.isFinite(item.similarityScore)) throw new ApiError("The API returned invalid visual-search results.");
    const product = adaptProduct(item.product);
    if (seen.has(product.id)) throw new ApiError("The API returned duplicate visual-search results.");
    seen.add(product.id);
    return { rank: item.rank as number, similarityScore: item.similarityScore, product };
  });
  return { queryType: value.data.queryType, results };
}
export async function searchByImage(file: File, topK = 4, signal?: AbortSignal): Promise<VisualSearchResponse> {
  return parseVisualSearchResponse(await apiFormRequest("/visual-search", createVisualSearchForm(file, topK), signal));
}
export async function searchByText(query: string, topK = 4, signal?: AbortSignal): Promise<VisualSearchResponse> {
  try { return parseVisualSearchResponse(await apiRequest("/visual-search/text", { method: "POST", body: { query, topK }, signal })); }
  catch (error) { if (error instanceof ApiError && error.status === 503) throw new ApiError("Visual search is temporarily unavailable.", 503, { cause: error }); throw error; }
}
export async function searchMultimodal(file: File | undefined, text: string | undefined, topK = 4, signal?: AbortSignal): Promise<VisualSearchResponse> {
  const form = createMultimodalForm(file, text, topK);
  return parseVisualSearchResponse(await apiFormRequest("/visual-search/multimodal", form, signal));
}
