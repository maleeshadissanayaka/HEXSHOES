import type { Product, ProductAudience } from "../../types/product";
import { ApiError, apiGet } from "./apiClient";
import { adaptProduct } from "./productAdapter";

export interface ProductQuery { category?: string; audience?: ProductAudience; new?: boolean }
function unwrap(value: unknown): unknown {
  if (typeof value !== "object" || value === null || !("success" in value) || !("data" in value) || value.success !== true) {
    throw new ApiError("The API returned an invalid response.");
  }
  return value.data;
}
export async function getProducts(query: ProductQuery = {}, signal?: AbortSignal): Promise<Product[]> {
  const params = new URLSearchParams();
  if (query.category) params.set("category", query.category);
  if (query.audience) params.set("audience", query.audience);
  if (query.new !== undefined) params.set("new", String(query.new));
  const data = unwrap(await apiGet(`/products${params.size ? `?${params}` : ""}`, signal));
  if (!Array.isArray(data)) throw new ApiError("The API returned an invalid product collection.");
  try { return data.map(adaptProduct); }
  catch (error) { throw new ApiError("The API returned an invalid product collection.", undefined, { cause: error }); }
}
export async function getProduct(id: string, signal?: AbortSignal): Promise<Product> {
  const data = unwrap(await apiGet(`/products/${encodeURIComponent(id)}`, signal));
  try { return adaptProduct(data); }
  catch (error) { throw new ApiError("The API returned an invalid product.", undefined, { cause: error }); }
}
