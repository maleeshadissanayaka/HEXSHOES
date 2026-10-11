import type { User } from "firebase/auth";
import type { CartLine } from "../../types/product";
import { ApiError } from "./apiClient";
import { authenticatedApiRequest } from "./auth.api";
import { adaptProduct } from "./productAdapter";

const isRecord = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
const unwrap = (value: unknown): unknown => {
  if (!isRecord(value) || value.success !== true || !("data" in value)) throw new ApiError("The API returned an invalid cart response.");
  return value.data;
};
const adaptLine = (value: unknown): CartLine => {
  if (!isRecord(value) || !Number.isInteger(value.quantity) || (value.quantity as number) < 1 || (value.quantity as number) > 10 || !isRecord(value.product)) throw new ApiError("The API returned an invalid cart item.");
  const product = adaptProduct(value.product);
  const fallbackSize = String(product.sizes[0] ?? "Selected");
  if (value.size !== undefined && (typeof value.size !== "string" || value.size.trim() === "")) throw new ApiError("The API returned an invalid cart item.");
  return { product, quantity: value.quantity as number, size: typeof value.size === "string" ? value.size : fallbackSize };
};

export async function getCart(user: User, signal?: AbortSignal): Promise<CartLine[]> {
  const data = unwrap(await authenticatedApiRequest(user, "/cart", { signal }));
  if (!Array.isArray(data)) throw new ApiError("The API returned an invalid cart.");
  return data.map(adaptLine);
}
export async function addCartItem(user: User, productId: string, quantity = 1, size?: string): Promise<CartLine> {
  return adaptLine(unwrap(await authenticatedApiRequest(user, `/cart/${encodeURIComponent(productId)}`, { method: "POST", body: { quantity, ...(size ? { size } : {}) } })));
}
export async function updateCartItem(user: User, productId: string, quantity: number, size?: string): Promise<CartLine> {
  return adaptLine(unwrap(await authenticatedApiRequest(user, `/cart/${encodeURIComponent(productId)}`, { method: "PATCH", body: { quantity, ...(size ? { size } : {}) } })));
}
export async function removeCartItem(user: User, productId: string): Promise<void> { await authenticatedApiRequest(user, `/cart/${encodeURIComponent(productId)}`, { method: "DELETE" }); }
export async function clearCart(user: User): Promise<void> { await authenticatedApiRequest(user, "/cart", { method: "DELETE" }); }
