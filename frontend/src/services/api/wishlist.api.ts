import type { User } from "firebase/auth";
import type { Product } from "../../types/product";
import { ApiError } from "./apiClient";
import { authenticatedApiRequest } from "./auth.api";
import { adaptProduct } from "./productAdapter";

const unwrap = (value: unknown): unknown => {
  if (typeof value !== "object" || value === null || !("success" in value) || value.success !== true || !("data" in value)) throw new ApiError("The API returned an invalid wishlist response.");
  return value.data;
};

export async function getWishlist(user: User, signal?: AbortSignal): Promise<Product[]> {
  const data = unwrap(await authenticatedApiRequest(user, "/wishlist", { signal }));
  if (!Array.isArray(data)) throw new ApiError("The API returned an invalid wishlist.");
  try { return data.map(adaptProduct); } catch (error) { throw new ApiError("The API returned an invalid wishlist.", undefined, { cause: error }); }
}

export async function addWishlistProduct(user: User, productId: string): Promise<Product> {
  return adaptProduct(unwrap(await authenticatedApiRequest(user, `/wishlist/${encodeURIComponent(productId)}`, { method: "POST" })));
}

export async function removeWishlistProduct(user: User, productId: string): Promise<void> {
  await authenticatedApiRequest(user, `/wishlist/${encodeURIComponent(productId)}`, { method: "DELETE" });
}
