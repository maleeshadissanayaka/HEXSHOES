import type { RequestHandler } from "express";
import { productService } from "../services/product.service.js";
import type { ProductAudience, ProductFilters } from "../types/product.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const parseAudience = (value: unknown): ProductAudience | undefined =>
  value === "men" || value === "women" || value === "unisex" ? value : undefined;
const parseBoolean = (value: unknown): boolean | undefined =>
  value === "true" ? true : value === "false" ? false : undefined;

export const listProducts: RequestHandler = asyncHandler(async (request, response) => {
  const filters: ProductFilters = {};
  if (typeof request.query.category === "string") filters.category = request.query.category.toLowerCase();
  const audience = parseAudience(request.query.audience);
  if (audience !== undefined) filters.audience = audience;
  const isNew = parseBoolean(request.query.new);
  if (isNew !== undefined) filters.isNew = isNew;
  response.status(200).json({ success: true, data: await productService.getProducts(filters) });
});

export const getProduct: RequestHandler<{ id: string }> = asyncHandler<{ id: string }>(async (request, response) => {
  const product = await productService.getProductById(request.params.id);
  if (product === undefined) {
    response.status(404).json({ success: false, error: { message: "Product not found" } });
    return;
  }
  response.status(200).json({ success: true, data: product });
});
