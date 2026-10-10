import { wishlistService } from "../services/wishlist.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

export const getWishlist = asyncHandler(async (request, response) => {
  if (!request.authUser) { response.status(401).json({ success: false, error: { message: "Authentication required" } }); return; }
  response.status(200).json({ success: true, data: await wishlistService.list(request.authUser.uid) });
});

export const addWishlistProduct = asyncHandler<{ productId: string }>(async (request, response) => {
  if (!request.authUser) { response.status(401).json({ success: false, error: { message: "Authentication required" } }); return; }
  try {
    const product = await wishlistService.add(request.authUser.uid, request.params.productId);
    response.status(200).json({ success: true, data: product });
  } catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") {
      response.status(404).json({ success: false, error: { message: "Product not found" } }); return;
    }
    throw error;
  }
});

export const removeWishlistProduct = asyncHandler<{ productId: string }>(async (request, response) => {
  if (!request.authUser) { response.status(401).json({ success: false, error: { message: "Authentication required" } }); return; }
  response.status(200).json({ success: true, data: await wishlistService.remove(request.authUser.uid, request.params.productId) });
});
