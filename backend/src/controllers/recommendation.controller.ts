import type { RequestHandler } from "express";
import { AiServiceResponseError, AiServiceUnavailableError } from "../services/ai.service.js";
import { recommendationService } from "../services/recommendation.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const handle = (error: unknown, response: Parameters<RequestHandler>[1]) => {
  if (error instanceof AiServiceUnavailableError || error instanceof AiServiceResponseError) { response.status(503).json({ success: false, error: { message: "Recommendations are temporarily unavailable" } }); return true; }
  return false;
};

export const similarProducts = asyncHandler<{ id: string }>(async (request, response) => {
  try { response.status(200).json({ success: true, data: { strategy: "clip-image-similarity", results: await recommendationService.similar(request.params.id, 3) } }); }
  catch (error) {
    if (error instanceof Error && error.message === "PRODUCT_NOT_FOUND") { response.status(404).json({ success: false, error: { message: "Product not found" } }); return; }
    if (!handle(error, response)) throw error;
  }
});

export const personalizedRecommendations: RequestHandler = asyncHandler(async (request, response) => {
  try { response.status(200).json({ success: true, data: await recommendationService.personalized(request.authUser!.uid) }); }
  catch (error) { if (!handle(error, response)) throw error; }
});
