import { cartService } from "../services/cart.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const uid = (request: { authUser?: { uid: string } }, response: { status: (code: number) => { json: (body: unknown) => void } }) => {
  if (request.authUser) return request.authUser.uid;
  response.status(401).json({ success: false, error: { message: "Authentication required" } });
  return undefined;
};
const failure = (error: unknown, response: { status: (code: number) => { json: (body: unknown) => void } }) => {
  if (!(error instanceof Error)) return false;
  if (error.message === "PRODUCT_NOT_FOUND") { response.status(404).json({ success: false, error: { message: "Product not found" } }); return true; }
  if (error.message === "INVALID_QUANTITY") { response.status(400).json({ success: false, error: { message: "Quantity must be an integer from 1 to 10" } }); return true; }
  if (error.message === "INVALID_SIZE") { response.status(400).json({ success: false, error: { message: "Size must be a non-empty string" } }); return true; }
  return false;
};

export const getCart = asyncHandler(async (request, response) => { const owner = uid(request, response); if (owner) response.status(200).json({ success: true, data: await cartService.list(owner) }); });
export const addCartItem = asyncHandler<{ productId: string }>(async (request, response) => { const owner = uid(request, response); if (!owner) return; try { response.status(200).json({ success: true, data: await cartService.add(owner, request.params.productId, request.body) }); } catch (error) { if (!failure(error, response)) throw error; } });
export const updateCartItem = asyncHandler<{ productId: string }>(async (request, response) => { const owner = uid(request, response); if (!owner) return; try { response.status(200).json({ success: true, data: await cartService.update(owner, request.params.productId, request.body) }); } catch (error) { if (!failure(error, response)) throw error; } });
export const removeCartItem = asyncHandler<{ productId: string }>(async (request, response) => { const owner = uid(request, response); if (owner) response.status(200).json({ success: true, data: await cartService.remove(owner, request.params.productId) }); });
export const clearCart = asyncHandler(async (request, response) => { const owner = uid(request, response); if (owner) response.status(200).json({ success: true, data: await cartService.clear(owner) }); });
