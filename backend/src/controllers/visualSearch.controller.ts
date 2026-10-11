import type { RequestHandler } from "express";
import { AiServiceResponseError, AiServiceUnavailableError } from "../services/ai.service.js";
import { visualSearchService } from "../services/visualSearch.service.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const topK = (value: unknown): number | undefined => {
  const parsed = value === undefined ? 4 : typeof value === "string" && /^\d+$/.test(value) ? Number(value) : value;
  return Number.isInteger(parsed) && (parsed as number) >= 1 && (parsed as number) <= 4 ? parsed as number : undefined;
};
export const hasValidImageSignature = (file: Express.Multer.File) => {
  const bytes = file.buffer;
  if (file.mimetype === "image/jpeg") return bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  if (file.mimetype === "image/png") return bytes.length >= 8 && bytes.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  return bytes.length >= 12 && bytes.subarray(0, 4).toString("ascii") === "RIFF" && bytes.subarray(8, 12).toString("ascii") === "WEBP";
};
const unavailable = (error: unknown, response: Parameters<RequestHandler>[1]) => {
  if (error instanceof AiServiceUnavailableError || error instanceof AiServiceResponseError) { response.status(503).json({ success: false, error: { message: "Visual search service is temporarily unavailable" } }); return true; }
  return false;
};

export const searchImage = asyncHandler(async (request, response) => {
  if (!request.file) { response.status(400).json({ success: false, error: { message: "An image file is required" } }); return; }
  if (!hasValidImageSignature(request.file)) { response.status(400).json({ success: false, error: { message: "The uploaded image is malformed or does not match its declared type" } }); return; }
  const limit = topK(request.body.topK);
  if (!limit) { response.status(400).json({ success: false, error: { message: "topK must be an integer from 1 to 4" } }); return; }
  try { response.status(200).json({ success: true, data: await visualSearchService.image({ buffer: request.file.buffer, mimeType: request.file.mimetype, filename: request.file.originalname }, limit) }); }
  catch (error) { if (!unavailable(error, response)) throw error; }
});

export const searchText = asyncHandler(async (request, response) => {
  if (!request.body || Object.keys(request.body).some((key) => key !== "query" && key !== "topK") || typeof request.body.query !== "string" || request.body.query.trim() === "" || request.body.query.length > 1000) { response.status(400).json({ success: false, error: { message: "A valid text query is required" } }); return; }
  const limit = topK(request.body.topK);
  if (!limit) { response.status(400).json({ success: false, error: { message: "topK must be an integer from 1 to 4" } }); return; }
  try { response.status(200).json({ success: true, data: await visualSearchService.text(request.body.query.trim(), limit) }); }
  catch (error) { if (!unavailable(error, response)) throw error; }
});

export const searchMultimodal = asyncHandler(async (request, response) => {
  const text = typeof request.body?.text === "string" && request.body.text.trim() ? request.body.text.trim() : undefined;
  if (!request.file && !text) { response.status(400).json({ success: false, error: { message: "An image or text query is required" } }); return; }
  if (request.file && !hasValidImageSignature(request.file)) { response.status(400).json({ success: false, error: { message: "The uploaded image is malformed or does not match its declared type" } }); return; }
  const limit = topK(request.body?.topK);
  if (!limit) { response.status(400).json({ success: false, error: { message: "topK must be an integer from 1 to 4" } }); return; }
  const image = request.file ? { buffer: request.file.buffer, mimeType: request.file.mimetype, filename: request.file.originalname } : undefined;
  try { response.status(200).json({ success: true, data: await visualSearchService.multimodal({ ...(image ? { image } : {}), ...(text ? { text } : {}) }, limit) }); }
  catch (error) { if (!unavailable(error, response)) throw error; }
});
